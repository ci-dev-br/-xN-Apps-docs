import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';
import { ScraperService } from '../services/scraper.service';
import { Public } from '@ci/auth/decorators/public.decorator';
import { Policy } from '@ci/core';
import { NewsVote, TipoVoto } from '../models/news-vote.entity';
import { NewsComment } from '../models/news-comment.entity';
import { SocialService } from '@ci/user/service/social.service';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

export class VoteInputDto {
    newsId: string;
    vote: TipoVoto;
}

export class CommentInputDto {
    newsId: string;
    content: string;
}

@ApiTags('News')
@Controller('News')
export class NewsController {
    private readonly feedCache = new Map<string, CacheEntry<News[]>>();
    private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

    constructor(
        @InjectRepository(News) private newsRepo: Repository<News>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
        @InjectRepository(NewsVote) private voteRepo: Repository<NewsVote>,
        @InjectRepository(NewsComment) private commentRepo: Repository<NewsComment>,
        private readonly service: ScraperService,
        private readonly socialService?: SocialService,
    ) { }

    @Public()
    @Post('getFeed')
    @ApiOperation({ operationId: 'getFeed' })
    @ApiQuery({ name: 'dataInicial', type: String, example: '2026-08-20T00:00:00.000Z', required: false })
    @ApiQuery({ name: 'dataFinal', type: String, example: '2026-08-28T23:59:59.999Z', required: false })
    @ApiResponse({ status: 200, type: [News] })
    async getFeed(
        @Query('dataInicial') dataInicialStr: string,
        @Query('dataFinal') dataFinalStr: string,
        @Query('offset') offset: number = 0,
        @Req() request?: any,
    ) {
        if (!dataInicialStr || !dataFinalStr) {
            throw new BadRequestException('Os parâmetros dataInicial e dataFinal são obrigatórios.');
        }

        const dataInicial = new Date(dataInicialStr);
        const dataFinal = new Date(dataFinalStr);

        if (isNaN(dataInicial.getTime()) || isNaN(dataFinal.getTime())) {
            throw new BadRequestException('Formato de data inválido. Utilize o formato ISO 8601.');
        }

        const isReader = (request?.user?.roles as string[])?.includes('READER') ?? false;
        const limit = isReader ? 30 : 25;
        const cacheKey = `${dataInicial.getTime()}_${dataFinal.getTime()}_${limit}_${offset}`;
        const now = Date.now();

        let rawPosts: News[];
        const cached = this.feedCache.get(cacheKey);

        if (cached && cached.expiresAt > now) {
            rawPosts = cached.data;
        } else {
            rawPosts = (await this.service?.getTrendingFeed(dataInicial, dataFinal, { limit, offset })) || [];
            this.feedCache.set(cacheKey, {
                data: rawPosts,
                expiresAt: now + this.CACHE_TTL_MS,
            });
        }

        const currentUserId = request?.user?.id;

        // Anexa contagem e status de voto se houver IDs
        const postsComInteracoes = await Promise.all(
            rawPosts.map(async post => {
                let upVotes = 0;
                let downVotes = 0;
                let commentsCount = 0;
                let userVote: TipoVoto | null = null;

                try {
                    if (post.id) {
                        const [votes, comments] = await Promise.all([
                            this.voteRepo.find({ where: { news: { id: post.id } } }),
                            this.commentRepo.count({ where: { news: { id: post.id } } }),
                        ]);

                        upVotes = votes.filter(v => v.vote === TipoVoto.UP).length;
                        downVotes = votes.filter(v => v.vote === TipoVoto.DOWN).length;
                        commentsCount = comments;

                        if (currentUserId) {
                            const found = votes.find(v => v.user?.id === currentUserId);
                            if (found) userVote = found.vote;
                        }
                    }
                } catch (e) {
                    // Falha silenciosa em contagem de interações
                }

                return {
                    ...post,
                    upVotes,
                    downVotes,
                    commentsCount,
                    userVote,
                    content: Policy(
                        { reading: post.content },
                        request,
                        'READER',
                        r => r.substring(0, 170) + ' \n\n[...]'
                    ).reading,
                };
            })
        );

        return postsComInteracoes;
    }

    /**
     * Vota UP ou DOWN em uma notícia do feed.
     * Requer usuário autenticado. Se o usuário clicar no mesmo voto, ele é removido (toggle).
     */
    @Post('Vote')
    @ApiOperation({ operationId: 'NewsVote' })
    async vote(@Body() input: VoteInputDto, @Req() req: any) {
        const user = req.user;
        if (!user || !user.id) {
            throw new UnauthorizedException('É necessário estar autenticado para votar em uma notícia.');
        }

        if (!input.newsId || !input.vote) {
            throw new BadRequestException('newsId e vote (UP ou DOWN) são obrigatórios.');
        }

        let news = await this.newsRepo.findOne({ where: { id: input.newsId } });
        if (!news) {
            // Tenta localizar por url se o id passado for na verdade uma url
            news = await this.newsRepo.findOne({ where: { url: input.newsId } });
        }

        if (!news) {
            throw new NotFoundException('Notícia não encontrada.');
        }

        const existingVote = await this.voteRepo.findOne({
            where: {
                news: { id: news.id },
                user: { id: user.id },
            },
        });

        if (existingVote) {
            if (existingVote.vote === input.vote) {
                // Desfaz o voto (toggle)
                await this.voteRepo.remove(existingVote);
            } else {
                // Altera o voto (ex: de UP para DOWN)
                existingVote.vote = input.vote;
                await this.voteRepo.save(existingVote);
            }
        } else {
            // Cria novo voto
            const newVote = this.voteRepo.create({
                news,
                user,
                vote: input.vote,
            });
            await this.voteRepo.save(newVote);
        }

        return await this.getVoteStatsInternal(news.id, user.id);
    }

    /**
     * Consulta as estatísticas de votos de uma notícia específica.
     */
    @Public()
    @Get('VoteStats/:newsId')
    @ApiOperation({ operationId: 'NewsVoteStats' })
    async getVoteStats(@Param('newsId') newsId: string, @Req() req: any) {
        const userId = req.user?.id;
        return await this.getVoteStatsInternal(newsId, userId);
    }

    private async getVoteStatsInternal(newsId: string, userId?: string) {
        const votes = await this.voteRepo.find({
            where: { news: { id: newsId } },
        });

        const upVotes = votes.filter(v => v.vote === TipoVoto.UP).length;
        const downVotes = votes.filter(v => v.vote === TipoVoto.DOWN).length;

        let userVote: TipoVoto | null = null;
        if (userId) {
            const found = votes.find(v => v.user?.id === userId);
            if (found) userVote = found.vote;
        }

        return {
            newsId,
            upVotes,
            downVotes,
            userVote,
        };
    }

    /**
     * Adiciona um comentário a uma notícia.
     * Requer usuário autenticado.
     */
    @Post('Comment')
    @ApiOperation({ operationId: 'NewsComment' })
    async addComment(@Body() input: CommentInputDto, @Req() req: any) {
        const user = req.user;
        if (!user || !user.id) {
            throw new UnauthorizedException('É necessário estar autenticado para comentar.');
        }

        if (!input.newsId || !input.content || !input.content.trim()) {
            throw new BadRequestException('newsId e content são obrigatórios.');
        }

        let news = await this.newsRepo.findOne({ where: { id: input.newsId } });
        if (!news) {
            news = await this.newsRepo.findOne({ where: { url: input.newsId } });
        }

        if (!news) {
            throw new NotFoundException('Notícia não encontrada.');
        }

        const comment = this.commentRepo.create({
            news,
            user,
            content: input.content.trim(),
        });

        const saved = await this.commentRepo.save(comment);

        return {
            id: saved.id,
            newsId: news.id,
            content: saved.content,
            createdAt: saved.createdAt,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                surname: user.surname,
                photo: user.photo,
            },
            socialStatus: {
                tipo: 'SELF',
                isFollowing: false,
                isFollower: false,
                isConhecido: false,
            },
        };
    }

    /**
     * Lista os comentários de uma notícia, incluindo o status de vínculo social
     * (Seguidor, Conhecido, etc.) entre o usuário atual e os autores dos comentários.
     */
    @Public()
    @Get('Comments/:newsId')
    @ApiOperation({ operationId: 'NewsGetComments' })
    async getComments(@Param('newsId') newsId: string, @Req() req: any) {
        let targetNewsId = newsId;
        const news = await this.newsRepo.findOne({
            where: [{ id: newsId }, { url: newsId }],
        });

        if (news) {
            targetNewsId = news.id;
        }

        const comments = await this.commentRepo.find({
            where: { news: { id: targetNewsId } },
            relations: ['user', 'user.photo'],
            order: { createdAt: 'ASC' },
        });

        const currentUserId = req.user?.id;

        const result = await Promise.all(
            comments.map(async c => {
                const author = c.user;
                let socialStatus: any = {
                    tipo: 'NENHUM',
                    isFollowing: false,
                    isFollower: false,
                    isConhecido: false,
                };

                if (currentUserId && author?.id) {
                    if (currentUserId === author.id) {
                        socialStatus = { tipo: 'SELF' };
                    } else if (this.socialService) {
                        socialStatus = await this.socialService.obterStatus(currentUserId, author.id);
                    }
                }

                return {
                    id: c.id,
                    content: c.content,
                    createdAt: c.createdAt,
                    user: author ? {
                        id: author.id,
                        username: author.username,
                        fullName: author.fullName,
                        surname: author.surname,
                        photo: author.photo,
                    } : null,
                    socialStatus,
                };
            })
        );

        return result;
    }
}