jest.mock('../services/scraper.service', () => ({
    ScraperService: class ScraperService {},
}));
jest.mock('@ci/user/service/social.service', () => ({
    SocialService: class SocialService {},
}));

import 'reflect-metadata';
import { CronExpression } from '@nestjs/schedule';
import { SCHEDULE_CRON_OPTIONS } from '@nestjs/schedule/dist/schedule.constants';
import { NewsReaderDigestService } from './news-reader-digest.service';
import { NewsController } from '../controller/news.controller';
import { TipoVoto } from '../models/news-vote.entity';
import { ROLE_KEY } from '@ci/auth/decorators/role.decorator';
import { IS_PUBLIC_KEY } from '@ci/auth/decorators/public.decorator';

describe('NewsReaderDigestService', () => {
    const createMockRepos = (opts: {
        newsRows?: any[];
        voteRows?: Array<{ newsId: string; vote: TipoVoto; total: string | number }>;
        readerUsers?: any[];
    }) => {
        const newsQb: any = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(opts.newsRows || []),
        };
        const newsRepo: any = {
            createQueryBuilder: jest.fn().mockReturnValue(newsQb),
        };

        const voteQb: any = {
            innerJoin: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            addGroupBy: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue(opts.voteRows || []),
        };
        const voteRepo: any = {
            createQueryBuilder: jest.fn().mockReturnValue(voteQb),
        };

        const userQb: any = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(opts.readerUsers || []),
        };
        const userRepo: any = {
            createQueryBuilder: jest.fn().mockReturnValue(userQb),
        };

        const notificationService: any = {
            criarNotificacao: jest.fn(async (dto: any) => ({ id: `notif-${dto.userId}`, ...dto })),
        };

        return { newsRepo, voteRepo, userRepo, notificationService, newsQb, voteQb, userQb };
    };

    it('deve registrar o cron a cada duas horas (0 */2 * * *) em handleBiHourlyReaderDigest', () => {
        const cronMetadata = Reflect.getMetadata(
            SCHEDULE_CRON_OPTIONS,
            NewsReaderDigestService.prototype.handleBiHourlyReaderDigest,
        );
        expect(cronMetadata).toBeDefined();
        expect(cronMetadata.cronTime).toBe(CronExpression.EVERY_2ND_HOUR);
        expect(cronMetadata.cronTime).toBe('0 */2 * * *');
    });

    it('deve coletar notícias mais recentes com mais curtidas, agrupar por similaridade, organizar por publicação e incluir autor e link original para usuários READER', async () => {
        const now = Date.now();
        const t1 = new Date(now - 10 * 60 * 1000); // mais recente
        const t2 = new Date(now - 30 * 60 * 1000);
        const t3 = new Date(now - 50 * 60 * 1000);
        const t4 = new Date(now - 90 * 60 * 1000);

        const newsRows = [
            {
                id: 'n-selic-1',
                title: 'Banco Central mantém taxa Selic em 10,5% ao ano',
                url: 'https://portal1.com.br/selic-bc',
                sourceName: 'Ana Paula Costa',
                content: 'O Comitê de Política Monetária do Banco Central manteve a Selic.',
                scrapedAt: t2,
                category: { id: 'cat-eco', name: 'Economia' },
                sourceInfo: { name: 'Portal 1', domain: 'portal1.com.br' },
            },
            {
                id: 'n-selic-2',
                title: 'Copom decide manter Selic após reunião do Banco Central',
                url: 'https://portal2.com.br/copom-selic',
                source: 'Redação Portal 2',
                content: 'Decisão sobre juros do Banco Central repercute no mercado financeiro.',
                scrapedAt: t1,
                category: { id: 'cat-eco', name: 'Economia' },
                sourceInfo: { name: 'Portal 2', domain: 'portal2.com.br' },
            },
            {
                id: 'n-petro-1',
                title: 'Petrobras anuncia dividendos extraordinários aos acionistas',
                url: 'https://portal3.com.br/petrobras-dividendos',
                content: 'Conselho da Petrobras aprovou distribuição recorde na bolsa.',
                scrapedAt: t3,
                category: { id: 'cat-bolsa', name: 'Bolsa' },
                sourceInfo: { name: 'Jornal B3', domain: 'portal3.com.br' },
            },
            {
                id: 'n-sem-curtida',
                title: 'Notícia recente sem nenhuma curtida registrada',
                url: 'https://portal4.com.br/sem-curtida',
                sourceName: 'Autor Qualquer',
                content: 'Conteúdo sem votos.',
                scrapedAt: t4,
                category: { id: 'cat-geral', name: 'Geral' },
            },
        ];

        const voteRows = [
            { newsId: 'n-selic-1', vote: TipoVoto.UP, total: '14' },
            { newsId: 'n-selic-2', vote: TipoVoto.UP, total: '9' },
            { newsId: 'n-selic-2', vote: TipoVoto.DOWN, total: '1' },
            { newsId: 'n-petro-1', vote: TipoVoto.UP, total: '20' },
        ];

        const readerUsers = [
            { id: 'reader-1', username: 'leitor1', roles: ['USER', 'READER'] },
            { id: 'reader-2', username: 'leitor2', roles: ['READER'] },
        ];

        const { newsRepo, voteRepo, userRepo, notificationService, userQb } = createMockRepos({
            newsRows,
            voteRows,
            readerUsers,
        });

        const service = new NewsReaderDigestService(newsRepo, voteRepo, userRepo, notificationService);
        const digest = await service.handleBiHourlyReaderDigest();

        expect(digest.targetRole).toBe('READER');
        expect(digest.totalNews).toBe(3); // apenas as com curtidas (> 0)
        expect(digest.totalClusters).toBe(2); // Selic/BC agrupadas + Petrobras separada
        expect(digest.notifiedReadersCount).toBe(2);

        // Grupos ordenados por tempo de publicação mais recente: grupo Selic tem t1 (mais recente que t3)
        expect(digest.groups[0].newsCount).toBe(2);
        expect(digest.groups[0].totalLikes).toBe(23);
        expect(digest.groups[0].items.map(i => i.id)).toEqual(['n-selic-2', 'n-selic-1']); // t1 antes de t2
        expect(digest.groups[0].items[0]).toMatchObject({
            id: 'n-selic-2',
            author: 'Redação Portal 2',
            originalUrl: 'https://portal2.com.br/copom-selic',
            likes: 9,
            dislikes: 1,
        });
        expect(digest.groups[0].items[1]).toMatchObject({
            id: 'n-selic-1',
            author: 'Ana Paula Costa',
            originalUrl: 'https://portal1.com.br/selic-bc',
            likes: 14,
        });

        expect(digest.groups[1].newsCount).toBe(1);
        expect(digest.groups[1].items[0]).toMatchObject({
            id: 'n-petro-1',
            author: 'Jornal B3',
            originalUrl: 'https://portal3.com.br/petrobras-dividendos',
            likes: 20,
        });

        expect(userQb.where).toHaveBeenCalledWith(':role = ANY(u.roles)', { role: 'READER' });
        expect(notificationService.criarNotificacao).toHaveBeenCalledTimes(2);
        expect(notificationService.criarNotificacao).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'reader-1',
                type: 'INFO',
                message: expect.stringContaining('https://portal2.com.br/copom-selic'),
            }),
        );
        expect(notificationService.criarNotificacao).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'reader-2',
                message: expect.stringContaining('Ana Paula Costa'),
            }),
        );
    });

    it('deve aplicar fallback para notícias mais recentes quando não houver curtidas ainda e não notificar em getLatestDigest sem refresh forçado de cron', async () => {
        const now = Date.now();
        const { newsRepo, voteRepo, userRepo, notificationService } = createMockRepos({
            newsRows: [
                {
                    id: 'n-1',
                    title: 'Mercado financeiro acompanha abertura da B3',
                    url: 'https://exemplo.com.br/b3',
                    scrapedAt: new Date(now - 5 * 60 * 1000),
                    sourceInfo: { domain: 'exemplo.com.br' },
                },
            ],
            voteRows: [],
            readerUsers: [{ id: 'reader-1', roles: ['READER'] }],
        });

        const service = new NewsReaderDigestService(newsRepo, voteRepo, userRepo, notificationService);
        const digest = await service.getLatestDigest();

        expect(digest.totalNews).toBe(1);
        expect(digest.groups[0].items[0].author).toBe('exemplo.com.br');
        expect(digest.groups[0].items[0].originalUrl).toBe('https://exemplo.com.br/b3');
        expect(digest.notifiedReadersCount).toBe(0);
        expect(notificationService.criarNotificacao).not.toHaveBeenCalled();
    });

    it('deve proteger o endpoint GET News/ReaderDigest com @Role("READER") e retornar o boletim', async () => {
        const roleMeta = Reflect.getMetadata(ROLE_KEY, NewsController.prototype.getReaderDigest);
        const publicMeta = Reflect.getMetadata(IS_PUBLIC_KEY, NewsController.prototype.getReaderDigest);
        expect(roleMeta).toBe('READER');
        expect(publicMeta).toBeUndefined();

        const mockDigest = {
            digestId: 'abc123',
            generatedAt: new Date(),
            windowHours: 24,
            targetRole: 'READER',
            totalNews: 1,
            totalClusters: 1,
            notifiedReadersCount: 1,
            groups: [],
        };
        const digestServiceMock: any = {
            getLatestDigest: jest.fn().mockResolvedValue(mockDigest),
        };
        const emptyRepo: any = { find: jest.fn(), findOne: jest.fn() };
        const controller = new NewsController(
            emptyRepo,
            emptyRepo,
            emptyRepo,
            emptyRepo,
            emptyRepo,
            {} as any,
            undefined,
            digestServiceMock,
        );

        const res = await controller.getReaderDigest('true');
        expect(digestServiceMock.getLatestDigest).toHaveBeenCalledWith({ refresh: true });
        expect(res).toBe(mockDigest);
    });
});
