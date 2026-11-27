import { DaoFullAuditedServiceBase } from './dao-full-audited-service-base';
import { FullAuditedEntity } from './entities';

class MockEntity extends FullAuditedEntity {
    nome?: string;
}

class MockService extends DaoFullAuditedServiceBase<MockEntity> {}

describe('DaoFullAuditedServiceBase - Transferência e leitura de Tenants', () => {
    function createService() {
        const snapMock: any = {
            snapshot: jest.fn().mockResolvedValue(undefined),
        };
        const repoMock: any = {
            metadata: {
                columns: [
                    { propertyName: 'internalId', type: 'uuid' },
                    { propertyName: 'nome', type: 'varchar' },
                ],
                relations: [{ propertyName: 'tenants' }],
            },
            create: jest.fn((d: any) => ({ ...d })),
            findOne: jest.fn(async ({ where }: any) => {
                if (!Array.isArray(where) && where?.internalId === 'obj-1') {
                    return { internalId: 'obj-1', nome: 'Item 1' };
                }
                return { internalId: 'obj-1', nome: 'Item 1', tenants: [{ id: 't-1', name: 'Tenant Matriz' }] };
            }),
            find: jest.fn().mockResolvedValue([]),
            save: jest.fn(async (entity: any) => entity),
        };
        return { service: new MockService(snapMock, repoMock), repoMock };
    }

    it('deve transferir objeto existente para um tenant proprietário e permitir remover o vínculo via sincronizar', async () => {
        const { service, repoMock } = createService();

        const transferred = await service.sincronizar(
            { internalId: 'obj-1', tenants: [{ id: 't-1', name: 'Tenant Matriz' } as any] },
            { chaveAcesso: 'cred-1' },
        );

        expect(transferred.tenants).toEqual([{ id: 't-1' }]);
        expect(repoMock.save).toHaveBeenCalledWith(
            expect.objectContaining({
                internalId: 'obj-1',
                tenants: [{ id: 't-1' }],
            }),
        );

        const returnedToUser = await service.sincronizar(
            { internalId: 'obj-1', tenants: [] },
            { chaveAcesso: 'cred-1' },
        );

        expect(returnedToUser.tenants).toEqual([]);
    });

    it('deve incluir tenants nas relations de getByInternalId e obterLista quando a entidade possui relação tenants', async () => {
        const { service, repoMock } = createService();

        await service.obterLista({}, { user: { id: 'u-1', tenants: [{ id: 't-1' }] } as any });
        expect(repoMock.find).toHaveBeenCalledWith(
            expect.objectContaining({
                relations: expect.objectContaining({ tenants: true }),
            }),
        );

        const item = await service.getByInternalId('obj-1', {
            user: { id: 'u-1', tenants: [{ id: 't-1' }] },
        });
        expect(item).toBeTruthy();
        expect(repoMock.findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                relations: expect.objectContaining({ tenants: true }),
            }),
        );
    });
});
