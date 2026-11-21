import { NewsController } from './news.controller';

describe('NewsController Correlated Search (Postgres + TypeORM)', () => {
    it('should build a Postgres FTS query using ts_rank_cd and ts_headline, exclude source article, and return matchedTerm + matchedSnippet', async () => {
        const qb: any = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            setParameter: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getRawAndEntities: jest.fn().mockResolvedValue({
                entities: [
                    {
                        id: 'news-2',
                        title: 'Banco Central mantém Selic e avalia impacto no câmbio',
                        url: 'https://exemplo.com.br/noticia-2',
                        content: 'O Banco Central destacou que a taxa Selic segue em patamar restritivo devido à inflação.',
                        sourceName: 'Portal Mercado',
                        category: { id: 'cat-1', name: 'Economia' },
                    },
                ],
                raw: [
                    {
                        news_id: 'news-2',
                        pg_rank: '0.8421',
                        pg_headline: 'O [[HL]]Banco Central[[/HL]] destacou que a taxa Selic segue em patamar restritivo.',
                    },
                ],
            }),
        };

        const newsRepo: any = {
            findOne: jest.fn().mockResolvedValue({
                id: '11111111-1111-1111-1111-111111111111',
                title: 'Copom sinaliza cautela com Selic e dólar',
                url: 'https://exemplo.com.br/noticia-1',
                content: 'Analistas acompanham decisão do Banco Central sobre juros e inflação no Brasil.',
                category: { id: 'cat-1', name: 'Economia' },
            }),
            createQueryBuilder: jest.fn().mockReturnValue(qb),
        };

        const emptyRepo: any = {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
        };

        const controller = new NewsController(
            newsRepo,
            emptyRepo,
            emptyRepo,
            emptyRepo,
            emptyRepo,
            {} as any,
        );

        const result = await controller.getCorrelated(
            {
                newsId: '11111111-1111-1111-1111-111111111111',
                phrase: 'Banco Central',
                limit: 6,
            },
            { user: { roles: ['READER'] } },
        );

        expect(newsRepo.createQueryBuilder).toHaveBeenCalledWith('news');
        expect(qb.andWhere).toHaveBeenCalledWith(
            expect.stringContaining(`to_tsvector('portuguese'`),
            expect.objectContaining({ tsQuery: expect.stringContaining('banco <-> central') }),
        );
        expect(qb.andWhere).toHaveBeenCalledWith('news.id != :sourceId', {
            sourceId: '11111111-1111-1111-1111-111111111111',
        });
        expect(qb.addSelect).toHaveBeenCalledWith(
            expect.stringContaining(`ts_rank_cd`),
            'pg_rank',
        );
        expect(qb.addSelect).toHaveBeenCalledWith(
            expect.stringContaining(`ts_headline`),
            'pg_headline',
        );

        expect(result).toHaveLength(1);
        expect(result[0].correlationScore).toBe(0.8421);
        expect(result[0].matchedTerm).toBe('Banco Central');
        expect(result[0].matchedSnippet).toBe('O Banco Central destacou que a taxa Selic segue em patamar restritivo.');
    });
});
