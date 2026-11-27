import { ForbiddenException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from '../models/tenant.entity';
import { TenantPermission } from '../models/tenant-permission.entity';

function makeRepo<T extends Record<string, any>>(idField: keyof T, initial: T[] = []) {
    const items: T[] = [...initial];
    const matchClause = (clause: any, item: any) => {
        for (const [k, v] of Object.entries(clause || {})) {
            if (v && typeof v === 'object' && 'type' in v) {
                const op = v as any;
                if (op.type === 'equal' && item[k] !== op.value) return false;
                if (op.type === 'in' && !op.value.includes(item[k])) return false;
                if (op.type === 'isNull' && item[k] !== null && item[k] !== undefined) return false;
            } else if (item[k] !== v) {
                return false;
            }
        }
        return true;
    };
    return {
        items,
        create: jest.fn((data: Partial<T>) => ({ ...data } as T)),
        save: jest.fn(async (entity: T) => {
            if (!entity[idField]) {
                (entity as any)[idField] = `${String(idField)}-${items.length + 1}`;
                items.push(entity);
            } else {
                const idx = items.findIndex(i => i[idField] === entity[idField]);
                if (idx >= 0) items[idx] = entity;
                else items.push(entity);
            }
            return entity;
        }),
        findOne: jest.fn(async (opts?: any) => {
            const where = opts?.where || {};
            if (Array.isArray(where)) {
                return items.find(i => where.some(c => matchClause(c, i))) || null;
            }
            return items.find(i => matchClause(where, i)) || null;
        }),
        find: jest.fn(async (opts?: any) => {
            const where = opts?.where || {};
            if (Array.isArray(where)) {
                return items.filter(i => where.some(c => matchClause(c, i)));
            }
            return items.filter(i => matchClause(where, i));
        }),
        delete: jest.fn(async (criteria: any) => {
            for (let i = items.length - 1; i >= 0; i--) {
                if (matchClause(criteria, items[i])) {
                    items.splice(i, 1);
                }
            }
            return { affected: 1 };
        }),
    };
}

describe('TenantService - TenantPermission (visualizar, ver, editar, compartilhar)', () => {
    it('deve criar tenant com permissão integral, editar quando permitido e gerenciar permissões de compartilhamento', async () => {
        const owner: any = { id: 'u-owner', username: 'owner', roles: ['USER'], tenants: [] };
        const viewer: any = { id: 'u-viewer', username: 'viewer', email: 'viewer@ci.dev.br', roles: ['USER'], tenants: [] };
        const hiddenUser: any = { id: 'u-hidden', username: 'hidden', roles: ['USER'], tenants: [] };

        const tenantRepo = makeRepo<Tenant>('id');
        const permRepo = makeRepo<TenantPermission>('id');
        const userRepo = makeRepo<any>('id', [owner, viewer, hiddenUser]);
        const emptyRepo = makeRepo<any>('id');

        const service = new TenantService(
            tenantRepo as any,
            emptyRepo as any,
            emptyRepo as any,
            emptyRepo as any,
            emptyRepo as any,
            emptyRepo as any,
            userRepo as any,
            permRepo as any,
        );

        // 1. Cria tenant para organização org-1
        const created = await service.criarTenant(
            { name: 'Tenant Comercial', descriptions: 'Área comercial', organizacaoId: 'org-1' },
            owner,
        );
        expect(created.id).toBeTruthy();
        expect(created.organizacaoId).toBe('org-1');
        expect(created.permissionsSummary).toEqual({
            canVisualizar: true,
            canVer: true,
            canEditar: true,
            canCompartilhar: true,
        });
        expect(permRepo.items).toHaveLength(1);

        // 2. Compartilha permissão apenas de visualizar/ver para u-viewer
        const viewerPerm = await service.definirPermissaoTenant(
            created.id!,
            {
                userId: viewer.id,
                canVisualizar: true,
                canVer: true,
                canEditar: false,
                canCompartilhar: false,
            },
            owner,
        );
        expect(viewerPerm.canVisualizar).toBe(true);
        expect(viewerPerm.canVer).toBe(true);
        expect(viewerPerm.canEditar).toBe(false);
        expect(viewerPerm.canCompartilhar).toBe(false);
        expect(viewer.tenants.some((t: any) => t.id === created.id)).toBe(true);

        // 3. u-viewer lista tenants disponíveis na organização org-1
        const availableForViewer = await service.listarTenantsDisponiveis(viewer, 'org-1');
        expect(availableForViewer).toHaveLength(1);
        expect(availableForViewer[0].id).toBe(created.id);
        expect(availableForViewer[0].permissionsSummary.canEditar).toBe(false);

        // 4. u-viewer NÃO pode editar nem compartilhar o tenant
        await expect(
            service.atualizarTenant(created.id!, { name: 'Tentativa' }, viewer),
        ).rejects.toThrow(ForbiddenException);

        await expect(
            service.definirPermissaoTenant(
                created.id!,
                { userId: hiddenUser.id, canVisualizar: true },
                viewer,
            ),
        ).rejects.toThrow(ForbiddenException);

        // 5. u-owner promove u-viewer com canEditar=true e u-viewer passa a editar
        await service.definirPermissaoTenant(
            created.id!,
            { userId: viewer.id, canEditar: true },
            owner,
        );
        const updated = await service.atualizarTenant(
            created.id!,
            { name: 'Tenant Comercial Atualizado', descriptions: 'Editado pelo colaborador' },
            viewer,
        );
        expect(updated.name).toBe('Tenant Comercial Atualizado');

        // 6. Permissão com canVisualizar=false e canVer=false oculta tenant de listarTenantsDisponiveis
        await service.definirPermissaoTenant(
            created.id!,
            { userId: hiddenUser.id, canVisualizar: false, canVer: false, canEditar: false, canCompartilhar: false },
            owner,
        );
        const availableForHidden = await service.listarTenantsDisponiveis(hiddenUser, 'org-1');
        expect(availableForHidden).toHaveLength(0);

        // 7. u-owner lista e remove permissão do u-hidden
        const permsList = await service.listarPermissoesTenant(created.id!, owner);
        const hiddenPerm = permsList.find(p => p.userId === hiddenUser.id);
        expect(hiddenPerm).toBeDefined();
        const removed = await service.removerPermissaoTenant(created.id!, hiddenPerm!.id!, owner);
        expect(removed).toEqual({ removed: true });
    });
});
