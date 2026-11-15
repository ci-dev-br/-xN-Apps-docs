import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';
import { ScraperService } from '../services/scraper.service';
import { Public } from '@ci/auth/decorators/public.decorator';
import { Policy } from '@ci/core';
import { NewsVote, TipoVoto } from '../models/news-vote.entity';
import { NewsComment } from '../models/news-comment.entity';
import { SocialService } from '@ci/user/service/social.service';
import { User } from '@ci/auth/models/user.entity';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

export class VoteInputDto {
    newsId: string;
    vote: TipoVoto;
    anonymousId?: string;
}

export class CommentInputDto {
    newsId: string;
    content: string;
    anonymousId?: string;
    authorName?: string;
}

export class AnonymousSessionInputDto {
    anonymousId?: string;
    authorName?: string;
}

@ApiTags('News')
@Controller('News')
export class NewsController {
    private readonly feedCache = new Map<string, CacheEntry<News[]>>();
    private readonly marketCache = new Map<string, CacheEntry<News[]>>();
    private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
    private financialCatIdsCache: string[] = [];
    private lastFinancialCatIdsFetch = 0;

    constructor(
        @InjectRepository(News) private newsRepo: Repository<News>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
        @InjectRepository(NewsVote) private voteRepo: Repository<NewsVote>,
        @InjectRepository(NewsComment) private commentRepo: Repository<NewsComment>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private readonly service: ScraperService,
        private readonly socialService?: SocialService,
    ) { }

    private isUuid(val?: string): boolean {
        if (!val) return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
    }

    private async resolveNewsByIdOrUrl(newsIdOrUrl: string): Promise<News | null> {
        if (!newsIdOrUrl) return null;
        const clean = newsIdOrUrl.trim();
        if (this.isUuid(clean)) {
            const byId = await this.newsRepo.findOne({ where: { id: clean } });
            if (byId) return byId;
        }
        return await this.newsRepo.findOne({ where: { url: clean } });
    }

    private extrairChaveAnonima(req: any, explicitAnonymousId?: string): string {
        const raw = (
            explicitAnonymousId ||
            req?.headers?.['x-anonymous-id'] ||
            req?.query?.['anonymousId'] ||
            ''
        ).toString().trim();

        if (raw && raw.length >= 6) {
            return createHash('sha256').update(raw).digest('hex').slice(0, 16);
        }

        const ip = (
            req?.headers?.['x-forwarded-for'] ||
            req?.socket?.remoteAddress ||
            req?.ip ||
            '127.0.0.1'
        ).toString();
        const ua = (req?.headers?.['user-agent'] || 'ci-browser').toString();
        return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 16);
    }

    /**
     * Obtém o usuário autenticado ou cria/recupera um usuário temporário anônimo
     * exclusivo para o cliente conectado.
     */
    private async resolveOrCreateActorUser(
        req: any,
        explicitAnonymousId?: string,
        allowCreate = true,
        customAuthorName?: string,
    ): Promise<User | null> {
        if (req?.user?.id) {
            const dbUser = await this.userRepo.findOne({
                where: { id: req.user.id },
                relations: ['photo'],
            });
            return dbUser || req.user;
        }

        const anonHash = this.extrairChaveAnonima(req, explicitAnonymousId);
        const anonUsername = `anon_${anonHash}`;
        const sufixo = anonHash.slice(0, 6).toUpperCase();

        let anonUser = await this.userRepo.findOne({
            where: { username: anonUsername },
            relations: ['photo'],
        });

        if (!anonUser && allowCreate) {
            const apelidoLimpo = customAuthorName?.trim();
            const surname = apelidoLimpo
                ? `${apelidoLimpo} (Anônimo #${sufixo.slice(0, 4)})`
                : `Visitante #${sufixo}`;
            const fullName = apelidoLimpo
                ? `${apelidoLimpo} — Visitante Anônimo #${sufixo}`
                : `Visitante Anônimo #${sufixo}`;

            try {
                const created = this.userRepo.create({
                    username: anonUsername,
                    fullName,
                    surname,
                    email: `${anonUsername}@temp.ci.dev.br`,
                    emailVerificado: false,
                    passwordMode: 'anonymous-temp',
                    roles: ['ANONYMOUS', 'READER'],
                });
                anonUser = await this.userRepo.save(created);
            } catch {
                // Em caso de corrida concorrente na criação do mesmo visitante anônimo
                anonUser = await this.userRepo.findOne({
                    where: { username: anonUsername },
                    relations: ['photo'],
                });
            }
        } else if (anonUser && customAuthorName?.trim()) {
            const apelidoLimpo = customAuthorName.trim();
            const novoSurname = `${apelidoLimpo} (Anônimo #${sufixo.slice(0, 4)})`;
            if (anonUser.surname !== novoSurname) {
                anonUser.surname = novoSurname;
                anonUser.fullName = `${apelidoLimpo} — Visitante Anônimo #${sufixo}`;
                anonUser = await this.userRepo.save(anonUser);
            }
        }

        return anonUser;
    }

    /**
     * Inicializa ou recupera a sessão de usuário temporário para clientes anônimos conectados.
     */
    @Public()
    @Post('AnonymousSession')
    @ApiOperation({ operationId: 'NewsAnonymousSession', summary: 'Cria ou recupera usuário temporário para cliente anônimo conectado' })
    async initAnonymousSession(@Body() input: AnonymousSessionInputDto, @Req() req: any) {
        const actor = await this.resolveOrCreateActorUser(req, input?.anonymousId, true, input?.authorName);
        return {
            isAnonymous: !req?.user?.id,
            anonymousId: input?.anonymousId || this.extrairChaveAnonima(req, input?.anonymousId),
            user: actor ? {
                id: actor.id,
                username: actor.username,
                fullName: actor.fullName,
                surname: actor.surname,
                roles: actor.roles,
            } : null,
        };
    }

    private async getFinancialCategoryIds(): Promise<string[]> {
        const now = Date.now();
        if (this.financialCatIdsCache.length > 0 && (now - this.lastFinancialCatIdsFetch < 10 * 60 * 1000)) {
            return this.financialCatIdsCache;
        }

        try {
            const cats = await this.categoryRepo.createQueryBuilder('c')
                .where(`c.name ILIKE '%economia%' OR c.name ILIKE '%mercado%' OR c.name ILIKE '%bolsa%'
                    OR c.name ILIKE '%finan%' OR c.name ILIKE '%dolar%' OR c.name ILIKE '%dólar%'
                    OR c.name ILIKE '%invest%' OR c.name ILIKE '%banco central%' OR c.name ILIKE '%selic%'
                    OR c.name ILIKE '%ipca%'`)
                .select(['c.id'])
                .getMany();

            this.financialCatIdsCache = cats.map(c => c.id);
            this.lastFinancialCatIdsFetch = now;
        } catch { }

        return this.financialCatIdsCache;
    }

    private obterTermosPorCategoriaMercado(category?: string): string[] {
        const cat = (category || '').trim().toLowerCase();
        const mapa: Record<string, string[]> = {
            bolsa: ['bolsa', 'ibovespa', 'ações', 'dividendos', 'petrobras', 'vale', 'pregão', 'investidor', 'mercado'],
            economia: ['economia', 'econômic', 'inflação', 'ipca', 'fazenda', 'mercado', 'financeir', 'orçamento', 'crescimento'],
            dolar: ['dolar', 'dólar', 'câmbio', 'cambio', 'cotação', 'moeda', 'exportação', 'mercado'],
            selic: ['selic', 'juros', 'copom', 'renda fixa', 'tesouro', 'banco central', 'crédito', 'financiamento'],
            'tributário': ['tributár', 'tributar', 'imposto', 'fiscal', 'receita federal', 'negócio', 'empresa', 'reforma', 'lucro', 'balanço'],
            tributario: ['tributár', 'tributar', 'imposto', 'fiscal', 'receita federal', 'negócio', 'empresa', 'reforma', 'lucro', 'balanço'],
        };

        if (cat && cat !== 'todos') {
            return mapa[cat] || [cat];
        }

        return [
            'mercado', 'economia', 'bolsa', 'ibovespa', 'dolar', 'dólar',
            'câmbio', 'selic', 'juros', 'ipca', 'inflação', 'financeir',
            'investiment', 'banco central', 'tributár', 'imposto', 'fiscal', 'petrobras'
        ];
    }

    private inferirCategoriaMercado(post: News, filtroCategoria?: string): string {
        const texto = `${post.title || ''} ${post.category?.name || ''}`.toLowerCase();
        if (/d[oó]lar|c[aâ]mbio|cotac[aã]o|moeda/.test(texto)) return 'Câmbio & Dólar';
        if (/selic|juros|copom|tesouro|banco central|cr[eé]dito/.test(texto)) return 'Juros & Selic';
        if (/bolsa|ibovespa|a[cç][oõ]es|dividend|petrobras|vale|investidor/.test(texto)) return 'Bolsa & B3';
        if (/tribut[aá]r|imposto|fiscal|receita|reforma|empresa|neg[oó]cio|lucro|balan[cç]o/.test(texto)) return 'Tributário & Negócios';
        if (/economia|econ[oô]mic|infla[cç][aã]o|ipca|fazenda|financeir|mercado/.test(texto)) return 'Macro & Economia';
        if (filtroCategoria && filtroCategoria.toLowerCase() !== 'todos') return filtroCategoria;
        return post.category?.name || 'Mercado';
    }

    /**
     * Obtém notícias filtradas de mercado e economia da base de dados (marketing.news).
     */
    @Public()
    @Get('Market')
    @ApiOperation({ operationId: 'getMarketNews', summary: 'Obtém notícias de mercado e economia da base de dados' })
    @ApiQuery({ name: 'search', type: String, required: false })
    @ApiQuery({ name: 'category', type: String, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'offset', type: Number, required: false })
    @ApiResponse({ status: 200, type: [News] })
    async getMarket(
        @Query('search') search?: string,
        @Query('category') category?: string,
        @Query('limit') limitStr?: string,
        @Query('offset') offsetStr?: string,
        @Req() request?: any,
    ) {
        const limit = Math.min(Math.max(parseInt(limitStr || '25', 10) || 25, 1), 100);
        const offset = Math.max(parseInt(offsetStr || '0', 10) || 0, 0);
        const cacheKey = `${(search || '').trim().toLowerCase()}|${(category || 'todos').trim().toLowerCase()}|${limit}|${offset}`;
        const now = Date.now();

        let rawPosts: News[];
        const cached = this.marketCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            rawPosts = cached.data;
        } else {
            let qb = this.newsRepo.createQueryBuilder('news')
                .leftJoinAndSelect('news.sourceInfo', 'source')
                .leftJoinAndSelect('news.category', 'category')
                .where(`news.title IS NOT NULL AND length(news.title) > 20 AND news.url ILIKE '%.br/%'`);

            if (search && search.trim()) {
                const cleanSearch = `%${search.trim().toLowerCase()}%`;
                qb = qb.andWhere(
                    '(LOWER(news.title) LIKE :search OR LOWER(category.name) LIKE :search)',
                    { search: cleanSearch }
                );
            } else {
                const termos = this.obterTermosPorCategoriaMercado(category);
                const paramsTermos: Record<string, any> = {};
                const clausulasTermos: string[] = [];

                termos.forEach((termo, idx) => {
                    const key = `termo_${idx}`;
                    paramsTermos[key] = `%${termo.toLowerCase()}%`;
                    clausulasTermos.push(`LOWER(news.title) LIKE :${key}`);
                    clausulasTermos.push(`LOWER(category.name) LIKE :${key}`);
                });

                if (clausulasTermos.length > 0) {
                    qb = qb.andWhere(`(${clausulasTermos.join(' OR ')})`, paramsTermos);
                }
            }

            qb = qb.orderBy('news.scrapedAt', 'DESC')
                .limit(limit)
                .offset(offset);

            rawPosts = await qb.getMany();

            this.marketCache.set(cacheKey, {
                data: rawPosts,
                expiresAt: now + this.CACHE_TTL_MS,
            });
        }

        const actorUser = await this.resolveOrCreateActorUser(request, request?.query?.['anonymousId'], true);
        const currentUserId = actorUser?.id;
        const postsComInteracoes = await Promise.all(
            rawPosts.map(async post => {
                let upVotes = 0;
                let downVotes = 0;
                let commentsCount = 0;
                let userVote: TipoVoto | null = null;

                try {
                    if (post.id) {
                        const [votes, comments] = await Promise.all([
                            this.voteRepo.find({ where: { news: { id: post.id } }, relations: ['user'] }),
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
                } catch { }

                return {
                    ...post,
                    categoria: this.inferirCategoriaMercado(post, category),
                    upVotes,
                    downVotes,
                    commentsCount,
                    userVote,
                    content: Policy(
                        { reading: post.content },
                        request,
                        'READER',
                        r => (r ? r.substring(0, 180) + ' \n\n[...]' : '')
                    ).reading,
                };
            })
        );

        return postsComInteracoes;
    }

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

        const actorUser = await this.resolveOrCreateActorUser(request, request?.query?.['anonymousId'], true);
        const currentUserId = actorUser?.id;

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
                            this.voteRepo.find({ where: { news: { id: post.id } }, relations: ['user'] }),
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
                        r => (r ? r.substring(0, 170) + ' \n\n[...]' : '')
                    ).reading,
                };
            })
        );

        return postsComInteracoes;
    }

    /**
     * Vota UP ou DOWN em uma notícia do feed.
     * Suporta usuários autenticados e clientes anônimos conectados (através de usuário temporário).
     * Se o usuário clicar no mesmo voto, ele é removido (toggle).
     */
    @Public()
    @Post('Vote')
    @ApiOperation({ operationId: 'NewsVote' })
    async vote(@Body() input: VoteInputDto, @Req() req: any) {
        if (!input?.newsId || !input?.vote) {
            throw new BadRequestException('newsId e vote (UP ou DOWN) são obrigatórios.');
        }

        const user = await this.resolveOrCreateActorUser(req, input.anonymousId, true);
        if (!user || !user.id) {
            throw new BadRequestException('Não foi possível identificar ou alocar o perfil de votação.');
        }

        const news = await this.resolveNewsByIdOrUrl(input.newsId);
        if (!news) {
            throw new NotFoundException('Notícia não encontrada.');
        }

        const existingVote = await this.voteRepo.findOne({
            where: {
                news: { id: news.id },
                user: { id: user.id },
            },
            relations: ['user', 'news'],
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
        const news = await this.resolveNewsByIdOrUrl(newsId);
        const targetId = news?.id || newsId;
        const actor = await this.resolveOrCreateActorUser(req, req?.query?.['anonymousId'], false);
        return await this.getVoteStatsInternal(targetId, actor?.id);
    }

    private async getVoteStatsInternal(newsId: string, userId?: string) {
        if (!this.isUuid(newsId)) {
            return { newsId, upVotes: 0, downVotes: 0, userVote: null };
        }

        const votes = await this.voteRepo.find({
            where: { news: { id: newsId } },
            relations: ['user'],
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
     * Suporta tanto usuários autenticados quanto clientes anônimos conectados (com usuário temporário).
     */
    @Public()
    @Post('Comment')
    @ApiOperation({ operationId: 'NewsComment' })
    async addComment(@Body() input: CommentInputDto, @Req() req: any) {
        if (!input?.newsId || !input?.content || !input.content.trim()) {
            throw new BadRequestException('newsId e content são obrigatórios.');
        }

        const user = await this.resolveOrCreateActorUser(req, input.anonymousId, true, input.authorName);
        if (!user || !user.id) {
            throw new BadRequestException('Não foi possível alocar o usuário para o comentário.');
        }

        const news = await this.resolveNewsByIdOrUrl(input.newsId);
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
                roles: user.roles,
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
     * (Seguidor, Conhecido, Você, etc.) entre o usuário atual (autenticado ou anônimo) e os autores.
     */
    @Public()
    @Get('Comments/:newsId')
    @ApiOperation({ operationId: 'NewsGetComments' })
    async getComments(@Param('newsId') newsId: string, @Req() req: any) {
        const news = await this.resolveNewsByIdOrUrl(newsId);
        if (!news || !this.isUuid(news.id)) {
            return [];
        }

        const comments = await this.commentRepo.find({
            where: { news: { id: news.id } },
            relations: ['user', 'user.photo'],
            order: { createdAt: 'ASC' },
        });

        const actorUser = await this.resolveOrCreateActorUser(req, req?.query?.['anonymousId'], false);
        const currentUserId = actorUser?.id;

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
                    } else if (this.socialService && req?.user?.id) {
                        socialStatus = await this.socialService.obterStatus(currentUserId, author.id);
                    }
                }

                return {
                    id: c.id,
                    newsId: news.id,
                    content: c.content,
                    createdAt: c.createdAt,
                    user: author ? {
                        id: author.id,
                        username: author.username,
                        fullName: author.fullName,
                        surname: author.surname,
                        photo: author.photo,
                        roles: author.roles,
                    } : null,
                    socialStatus,
                };
            })
        );

        return result;
    }
}