import { CarteiraService } from './carteira.service';

describe('CarteiraService — Segmentação por Tenants', () => {
  let service: CarteiraService;
  let carteiraRepo: any;
  let transacaoRepo: any;

  const carteirasDb = [
    {
      internalId: 'cart-a',
      userId: 'user-1',
      nome: 'Carteira Tenant A',
      numeroCarteira: 'CI-BRL-A',
      saldo: 1500,
      saldoBloqueado: 0,
      moeda: 'BRL',
      principal: true,
      deleted: false,
      tenants: [{ id: 'tenant-a', name: 'Tenant A' }],
    },
    {
      internalId: 'cart-b',
      userId: 'user-1',
      nome: 'Carteira Tenant B',
      numeroCarteira: 'CI-BRL-B',
      saldo: 500,
      saldoBloqueado: 0,
      moeda: 'BRL',
      principal: false,
      deleted: false,
      tenants: [{ id: 'tenant-b', name: 'Tenant B' }],
    },
  ];

  beforeEach(() => {
    carteiraRepo = {
      find: jest.fn(async () => carteirasDb.map((c) => ({ ...c }))),
      create: jest.fn((data: any) => ({ internalId: 'cart-new', ...data })),
      save: jest.fn(async (entity: any) => entity),
    };
    transacaoRepo = {
      find: jest.fn(async () => []),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(async () => []),
      })),
    };
    service = new CarteiraService(carteiraRepo, transacaoRepo);
  });

  it('filtra listarCarteirasUsuario por tenantIds e agrega saldo do dashboard corretamente', async () => {
    const todas = await service.listarCarteirasUsuario('user-1');
    expect(todas.length).toBe(2);

    const apenasA = await service.listarCarteirasUsuario('user-1', ['tenant-a']);
    expect(apenasA.map((c) => c.internalId)).toEqual(['cart-a']);

    const dashboardB = await service.obterDashboardCarteiras('user-1', { periodo: '30D', tenantIds: ['tenant-b'] });
    expect(dashboardB.resumo.patrimonioTotalBrl).toBeCloseTo(500);
    expect(dashboardB.desempenhoCarteiras.map((d) => d.carteiraId)).toEqual(['cart-b']);
  });

  it('associa tenantIds ao criar nova carteira', async () => {
    const res = await service.criarCarteira('user-1', {
      nome: 'Reserva Tenant A',
      moeda: 'BRL',
      tenantIds: ['tenant-a'],
    });
    expect(res.criada).toBe(true);
    expect(carteiraRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenants: [{ id: 'tenant-a' }],
      }),
    );
  });
});
