import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { News } from '../models/news.entity';
import { NewsVote, TipoVoto } from '../models/news-vote.entity';
import { User } from '@ci/auth/models/user.entity';
import { NotificationService } from '@ci/notification';
import {
    ReaderNewsClusterDto,
    ReaderNewsDigestDto,
    ReaderNewsDigestItemDto,
} from '../dto/reader-digest.dto';
import {
    computeTokenSetSimilarity,
    extractSignificantTokens,
    resolveNewsAuthor,
    stripHtmlAndEntities,
} from '../utils/news-text.utils';

interface InternalNewsCandidate {
    news: News;
    upVotes: number;
    downVotes: number;
    publishedAt: Date;
}

interface InternalClusterBuilder {
    items: Array<{
        dto: ReaderNewsDigestItemDto;
        titleTokens: string[];
        combinedTokens: string[];
        categoryLower: string;
    }>;
}

export interface GenerateReaderDigestOptions {
    windowHours?: number;
    limit?: number;
    candidateLimit?: number;
    notifyReaders?: boolean;
    refresh?: boolean;
}

@Injectable()
export class NewsReaderDigestService {
    private readonly logger = new Logger(NewsReaderDigestService.name);
    private readonly TARGET_ROLE = 'READER';
    private readonly DEFAULT_WINDOW_HOURS = 24;
    private readonly DEFAULT_LIMIT = 30;
    private readonly DEFAULT_CANDIDATE_LIMIT = 200;
    private readonly CACHE_TTL_MS = 2 * 60 * 60 * 1000;

    private latestDigest: ReaderNewsDigestDto | null = null;
    private inFlightPromise: Promise<ReaderNewsDigestDto> | null = null;

    constructor(
        @InjectRepository(News)
        private readonly newsRepo: Repository<News>,
        @InjectRepository(NewsVote)
        private readonly voteRepo: Repository<NewsVote>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @Optional()
        private readonly notificationService?: NotificationService,
    ) {}

    /**
     * Cron executado a cada duas horas:
     * coleta as notícias mais recentes com mais curtidas, agrupa por similaridade,
     * organiza por tempo de publicação (com autor e link original) e entrega aos usuários com role READER.
     */
    @Cron(CronExpression.EVERY_2ND_HOUR, { name: 'reader-news-digest-every-2h' })
    async handleBiHourlyReaderDigest(): Promise<ReaderNewsDigestDto> {
        if (this.inFlightPromise) {
            return this.inFlightPromise;
        }

        this.inFlightPromise = this.generateAndDispatchDigest({
            windowHours: this.DEFAULT_WINDOW_HOURS,
            limit: this.DEFAULT_LIMIT,
            notifyReaders: true,
        }).finally(() => {
            this.inFlightPromise = null;
        });

        return this.inFlightPromise;
    }

    async getLatestDigest(options?: GenerateReaderDigestOptions): Promise<ReaderNewsDigestDto> {
        const now = Date.now();
        const isFresh =
            this.latestDigest &&
            now - new Date(this.latestDigest.generatedAt).getTime() < this.CACHE_TTL_MS;

        if (!options?.refresh && isFresh && this.latestDigest) {
            return this.latestDigest;
        }

        return await this.generateAndDispatchDigest({
            windowHours: options?.windowHours ?? this.DEFAULT_WINDOW_HOURS,
            limit: options?.limit ?? this.DEFAULT_LIMIT,
            candidateLimit: options?.candidateLimit ?? this.DEFAULT_CANDIDATE_LIMIT,
            notifyReaders: options?.notifyReaders ?? false,
        });
    }

    async generateAndDispatchDigest(
        options?: GenerateReaderDigestOptions,
    ): Promise<ReaderNewsDigestDto> {
        const windowHours = Math.max(1, options?.windowHours ?? this.DEFAULT_WINDOW_HOURS);
        const limit = Math.min(Math.max(1, options?.limit ?? this.DEFAULT_LIMIT), 100);
        const candidateLimit = Math.max(limit, options?.candidateLimit ?? this.DEFAULT_CANDIDATE_LIMIT);
        const shouldNotify = options?.notifyReaders ?? true;

        this.logger.log(
            `Coletando notícias mais recentes e curtidas (janela=${windowHours}h, limite=${limit}) para role ${this.TARGET_ROLE}...`,
        );

        const candidates = await this.collectRecentLikedNews(windowHours, candidateLimit, limit);
        const items = candidates.map(c => this.mapCandidateToDto(c));
        const groups = this.groupAndOrganizeByPublicationTime(items);

        const generatedAt = new Date();
        const digestId = createHash('sha256')
            .update(`${generatedAt.toISOString()}|${items.map(i => i.id).join(',')}`)
            .digest('hex')
            .slice(0, 16);

        const digest: ReaderNewsDigestDto = {
            digestId,
            generatedAt,
            windowHours,
            targetRole: this.TARGET_ROLE,
            totalNews: items.length,
            totalClusters: groups.length,
            notifiedReadersCount: 0,
            groups,
        };

        if (shouldNotify && items.length > 0) {
            digest.notifiedReadersCount = await this.notifyReaderUsers(digest);
        }

        this.latestDigest = digest;
        this.logger.log(
            `Digest ${digest.digestId} gerado: ${digest.totalNews} notícia(s) em ${digest.totalClusters} grupo(s); ${digest.notifiedReadersCount} leitor(es) notificado(s).`,
        );
        return digest;
    }

    private async collectRecentLikedNews(
        windowHours: number,
        candidateLimit: number,
        limit: number,
    ): Promise<InternalNewsCandidate[]> {
        const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

        let recentNews = await this.newsRepo
            .createQueryBuilder('news')
            .leftJoinAndSelect('news.sourceInfo', 'source')
            .leftJoinAndSelect('news.category', 'category')
            .where('news.title IS NOT NULL AND news.url IS NOT NULL')
            .andWhere('news.scrapedAt >= :since', { since })
            .orderBy('news.scrapedAt', 'DESC')
            .limit(candidateLimit)
            .getMany();

        if (recentNews.length === 0) {
            recentNews = await this.newsRepo
                .createQueryBuilder('news')
                .leftJoinAndSelect('news.sourceInfo', 'source')
                .leftJoinAndSelect('news.category', 'category')
                .where('news.title IS NOT NULL AND news.url IS NOT NULL')
                .orderBy('news.scrapedAt', 'DESC')
                .limit(candidateLimit)
                .getMany();
        }

        if (recentNews.length === 0) {
            return [];
        }

        const voteMap = await this.aggregateVotesByNewsIds(
            recentNews.map(n => n.id).filter(Boolean),
        );

        const candidates: InternalNewsCandidate[] = recentNews.map(news => {
            const votes = voteMap.get(news.id) || { upVotes: 0, downVotes: 0 };
            return {
                news,
                upVotes: votes.upVotes,
                downVotes: votes.downVotes,
                publishedAt: news.scrapedAt ? new Date(news.scrapedAt) : new Date(0),
            };
        });

        candidates.sort((a, b) => {
            if (b.upVotes !== a.upVotes) {
                return b.upVotes - a.upVotes;
            }
            return b.publishedAt.getTime() - a.publishedAt.getTime();
        });

        const likedOnly = candidates.filter(c => c.upVotes > 0);
        const selected = likedOnly.length > 0 ? likedOnly : candidates;
        return selected.slice(0, limit);
    }

    private async aggregateVotesByNewsIds(
        newsIds: string[],
    ): Promise<Map<string, { upVotes: number; downVotes: number }>> {
        const result = new Map<string, { upVotes: number; downVotes: number }>();
        if (newsIds.length === 0) {
            return result;
        }

        try {
            const rawRows: Array<Record<string, any>> = await this.voteRepo
                .createQueryBuilder('v')
                .innerJoin('v.news', 'n')
                .select('n.id', 'newsId')
                .addSelect('v.vote', 'vote')
                .addSelect('COUNT(*)', 'total')
                .where('n.id IN (:...newsIds)', { newsIds })
                .groupBy('n.id')
                .addGroupBy('v.vote')
                .getRawMany();

            for (const row of rawRows || []) {
                const newsId = row['newsId'] || row['n_id'] || row['news_id'];
                if (!newsId) continue;
                const entry = result.get(newsId) || { upVotes: 0, downVotes: 0 };
                const total = Number(row['total'] || 0);
                if (row['vote'] === TipoVoto.UP) {
                    entry.upVotes += total;
                } else if (row['vote'] === TipoVoto.DOWN) {
                    entry.downVotes += total;
                }
                result.set(newsId, entry);
            }
        } catch (err: any) {
            this.logger.warn(`Falha ao agregar curtidas das notícias: ${err?.message || err}`);
        }

        return result;
    }

    private mapCandidateToDto(candidate: InternalNewsCandidate): ReaderNewsDigestItemDto {
        const { news, upVotes, downVotes, publishedAt } = candidate;
        const cleanSnippet = stripHtmlAndEntities(news.content || '').slice(0, 180).trim();
        return {
            id: news.id,
            title: stripHtmlAndEntities(news.title || '') || news.title,
            author: resolveNewsAuthor(news),
            originalUrl: news.url,
            publishedAt,
            likes: upVotes,
            dislikes: downVotes,
            category: news.category?.name || undefined,
            snippet: cleanSnippet || undefined,
        };
    }

    /**
     * Agrupa notícias por similaridade textual (título + categoria + trecho)
     * e organiza tanto os itens de cada grupo quanto os grupos por tempo de publicação (mais recentes primeiro).
     */
    groupAndOrganizeByPublicationTime(items: ReaderNewsDigestItemDto[]): ReaderNewsClusterDto[] {
        if (!items || items.length === 0) {
            return [];
        }

        const builders: InternalClusterBuilder[] = [];

        for (const dto of items) {
            const titleTokens = extractSignificantTokens(dto.title || '', 12, {
                normalizeAccents: true,
            });
            const combinedTokens = extractSignificantTokens(
                `${dto.title || ''} ${dto.category || ''} ${dto.snippet || ''}`,
                18,
                { normalizeAccents: true },
            );
            const categoryLower = (dto.category || '').trim().toLowerCase();

            let bestClusterIdx = -1;
            let bestScore = 0;

            for (let i = 0; i < builders.length; i++) {
                const cluster = builders[i];
                let clusterBest = 0;

                for (const member of cluster.items) {
                    const titleSim = computeTokenSetSimilarity(titleTokens, member.titleTokens);
                    const combinedSim = computeTokenSetSimilarity(combinedTokens, member.combinedTokens);
                    const sameCategoryBonus =
                        categoryLower &&
                        categoryLower === member.categoryLower &&
                        (titleSim.sharedCount >= 1 || combinedSim.sharedCount >= 2)
                            ? 0.08
                            : 0;

                    const score = 0.7 * titleSim.score + 0.3 * combinedSim.score + sameCategoryBonus;
                    const matchesThreshold =
                        score >= 0.28 ||
                        (titleSim.sharedCount >= 2 && score >= 0.22);

                    if (matchesThreshold && score > clusterBest) {
                        clusterBest = score;
                    }
                }

                if (clusterBest > bestScore) {
                    bestScore = clusterBest;
                    bestClusterIdx = i;
                }
            }

            const entry = { dto, titleTokens, combinedTokens, categoryLower };
            if (bestClusterIdx >= 0) {
                builders[bestClusterIdx].items.push(entry);
            } else {
                builders.push({ items: [entry] });
            }
        }

        const clusters: ReaderNewsClusterDto[] = builders.map((builder, idx) => {
            const sortedMembers = [...builder.items].sort((a, b) => {
                const diff =
                    new Date(b.dto.publishedAt).getTime() - new Date(a.dto.publishedAt).getTime();
                if (diff !== 0) return diff;
                return b.dto.likes - a.dto.likes;
            });

            const clusterItems = sortedMembers.map(m => m.dto);
            const totalLikes = clusterItems.reduce((sum, item) => sum + item.likes, 0);
            const latestPublishedAt = new Date(clusterItems[0].publishedAt);
            const oldestPublishedAt = new Date(clusterItems[clusterItems.length - 1].publishedAt);

            const tokenFreq = new Map<string, number>();
            for (const member of sortedMembers) {
                for (const token of new Set(member.titleTokens)) {
                    tokenFreq.set(token, (tokenFreq.get(token) || 0) + 1);
                }
            }
            const keywords = Array.from(tokenFreq.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([token]) => token);

            const topic =
                clusterItems.length > 1 && keywords.length >= 2
                    ? `${clusterItems[0].category ? `${clusterItems[0].category}: ` : ''}${keywords.slice(0, 3).join(', ')}`
                    : clusterItems[0].title;

            const clusterId = createHash('sha256')
                .update(`${idx}|${clusterItems.map(i => i.id || i.originalUrl).join(',')}`)
                .digest('hex')
                .slice(0, 12);

            return {
                clusterId,
                topic,
                keywords,
                totalLikes,
                newsCount: clusterItems.length,
                latestPublishedAt,
                oldestPublishedAt,
                items: clusterItems,
            };
        });

        // Organiza os grupos por tempo de publicação (grupo com notícia mais recente primeiro)
        clusters.sort((a, b) => {
            const diff = b.latestPublishedAt.getTime() - a.latestPublishedAt.getTime();
            if (diff !== 0) return diff;
            return b.totalLikes - a.totalLikes;
        });

        return clusters;
    }

    private async findReaderUsers(): Promise<User[]> {
        try {
            return await this.userRepo
                .createQueryBuilder('u')
                .where(':role = ANY(u.roles)', { role: this.TARGET_ROLE })
                .andWhere('(u.passwordMode IS NULL OR u.passwordMode != :anonMode)', {
                    anonMode: 'anonymous-temp',
                })
                .getMany();
        } catch (err: any) {
            this.logger.warn(`Falha ao consultar usuários com role ${this.TARGET_ROLE}: ${err?.message || err}`);
            return [];
        }
    }

    private formatDigestMessage(digest: ReaderNewsDigestDto): string {
        const lines: string[] = [];
        for (const group of digest.groups.slice(0, 5)) {
            lines.push(`• ${group.topic} (${group.totalLikes} curtidas):`);
            for (const item of group.items.slice(0, 3)) {
                const timeStr = new Date(item.publishedAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                lines.push(
                    `  - [${timeStr}] ${item.title} — ${item.author} (${item.likes} curtidas) | ${item.originalUrl}`,
                );
            }
        }
        return lines.join('\n');
    }

    private async notifyReaderUsers(digest: ReaderNewsDigestDto): Promise<number> {
        if (!this.notificationService) {
            return 0;
        }

        const readers = await this.findReaderUsers();
        if (readers.length === 0) {
            return 0;
        }

        const title = `Boletim de Notícias (2h) — ${digest.totalClusters} tema(s) em destaque`;
        const message = this.formatDigestMessage(digest);
        let notifiedCount = 0;

        for (const reader of readers) {
            if (!reader?.id) continue;
            try {
                const created = await this.notificationService.criarNotificacao({
                    userId: reader.id,
                    title,
                    message,
                    type: 'INFO',
                    actionUrl: '/',
                    metadata: {
                        digestId: digest.digestId,
                        generatedAt: digest.generatedAt,
                        windowHours: digest.windowHours,
                        targetRole: digest.targetRole,
                        totalNews: digest.totalNews,
                        totalClusters: digest.totalClusters,
                        groups: digest.groups,
                    },
                });
                if (created) {
                    notifiedCount++;
                }
            } catch (err: any) {
                this.logger.warn(
                    `Falha ao notificar usuário READER ${reader.id}: ${err?.message || err}`,
                );
            }
        }

        return notifiedCount;
    }
}
