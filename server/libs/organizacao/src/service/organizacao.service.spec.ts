import { Organizacao } from '../model/organizacao.entity';
import { OrganizacaoMembro } from '../model/organizacao-membro.entity';
import { OrganizacaoRole } from '../model/organizacao-role.entity';
import { OrganizacaoService } from './organizacao.service';

describe('OrganizacaoService', () => {
    function makeRepo<T extends Record<string, any>>(idField: keyof T, initial: T[] = []) {
        const items: T[] = [...initial];
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
                const matchClause = (clause: any, item: any) => {
                    for (const [k, v] of Object.entries(clause)) {
                        if (v && typeof v === 'object' && 'type' in v) {
                            if ((v as any).type === 'isNull') {
                                if (item[k] !== null && item[k] !== undefined) return false;
                            } else if ((v as any).type === 'equal') {
                                if (item[k] !== (v as any).value) return false;
                            }
                        } else if (item[k] !== v) {
                            return false;
                        }
                    }
                    return true;
                };
                if (Array.isArray(where)) {
                    return items.find(i => where.some(c => matchClause(c, i))) || null;
                }
                return items.find(i => matchClause(where, i)) || null;
            }),
            find: jest.fn(async (opts?: any) => {
                const where = opts?.where || {};
                const matchClause = (clause: any, item: any) => {
                    for (const [k, v] of Object.entries(clause)) {
                        if (v && typeof v === 'object' && 'type' in v) {
                            if ((v as any).type === 'isNull') {
                                if (item[k] !== null && item[k] !== undefined) return false;
                            } else if ((v as any).type === 'equal') {
                                if (item[k] !== (v as any).value) return false;
                            } else if ((v as any).type === 'in') {
                                if (!(v as any).value.includes(item[k])) return false;
                            }
                        } else if (k === 'createdBy' && v && typeof v === 'object' && 'identifiedUser' in v) {
                            if (item.createdBy?.identifiedUser !== (v as any).identifiedUser.value) return false;
                        } else if (item[k] !== v) {
                            return false;
                        }
                    }
                    return true;
                };
                if (Array.isArray(where)) {
                    return items.filter(i => where.some(c => matchClause(c, i)));
                }
                return items.filter(i => matchClause(where, i));
            }),
        };
    }

    it('deve normalizar roles personalizados com prefixo ORG', () => {
        const snap: any = { snapshot: jest.fn() };
        const service = new OrganizacaoService(snap, makeRepo<Organizacao>('internalId') as any);

        expect(service.normalizeOrgRoleCode('Financeiro').code).toBe('ORG_FINANCEIRO');
        expect(service.normalizeOrgRoleCode('ORG_VENDAS').code).toBe('ORG_VENDAS');
        expect(service.normalizeOrgRoleCode('ORGEditor').code).toBe('ORGEDITOR');
        expect(() => service.normalizeOrgRoleCode('ORG')).toThrow();
    });

    it('deve criar organização com Tenant, compartilhar via Tenant com outro usuário e atribuir roles ORG personalizados', async () => {
        const snap: any = { snapshot: jest.fn() };
        const orgRepo = makeRepo<Organizacao>('internalId');
        const membroRepo = makeRepo<OrganizacaoMembro>('internalId');
        const roleRepo = makeRepo<OrganizacaoRole>('internalId');
        const tenantRepo = makeRepo<any>('id');
        const ownerUser: any = {
            id: 'user-owner',
            email: 'owner@ci.dev.br',
            fullName: 'Criador',
            username: 'owner',
            roles: ['USER'],
            tenants: [],
        };
        const colleagueUser: any = {
            id: 'user-colleague',
            email: 'colega@ci.dev.br',
            fullName: 'Colega',
            username: 'colega',
            roles: ['USER'],
            tenants: [],
        };
        const userRepo = makeRepo<any>('id', [ownerUser, colleagueUser]);

        const service = new OrganizacaoService(
            snap,
            orgRepo as any,
            membroRepo as any,
            roleRepo as any,
            tenantRepo as any,
            userRepo as any,
        );

        const reqOwner = { user: ownerUser, chaveAcesso: 'cred-owner' };

        // 1. Cria organização
        const created = await service.criarOrganizacao(
            { organizatioName: 'CI Labs', description: 'Unidade de P&D' },
            reqOwner,
        );

        expect(created.organizatioName).toBe('CI Labs');
        expect(created.tenantId).toBeTruthy();
        expect(ownerUser.tenants.some((t: any) => t.id === created.tenantId)).toBe(true);
        expect(ownerUser.roles).toContain('ORG_ADMIN');

        // 2. Cria role personalizado com prefixo ORG
        const customRole = await service.criarRole(
            created.internalId!,
            { name: 'Financeiro', description: 'Gestão financeira da organização' },
            reqOwner,
        );
        expect(customRole.code).toBe('ORG_FINANCEIRO');

        // 3. Compartilha via Tenant com outro usuário atribuindo o role ORG_FINANCEIRO
        const sharedMember = await service.compartilharComUsuario(
            created.internalId!,
            { userId: colleagueUser.id, roles: ['Financeiro'] },
            reqOwner,
        );

        expect(sharedMember.tenantId).toBe(created.tenantId);
        expect(sharedMember.roles).toEqual(['ORG_FINANCEIRO']);
        expect(colleagueUser.tenants.some((t: any) => t.id === created.tenantId)).toBe(true);
        expect(colleagueUser.roles).toContain('ORG_FINANCEIRO');
        expect(colleagueUser.roles).toContain('USER');

        // 4. Atualiza roles do membro e verifica sincronização em User.roles
        const updatedMember = await service.atribuirRolesMembro(
            created.internalId!,
            sharedMember.internalId!,
            ['Auditoria'],
            reqOwner,
        );
        expect(updatedMember.roles).toEqual(['ORG_AUDITORIA']);
        expect(colleagueUser.roles).toContain('ORG_AUDITORIA');
        expect(colleagueUser.roles).not.toContain('ORG_FINANCEIRO');

        // 5. Revoga acesso do membro e verifica remoção do Tenant e dos roles ORG
        await service.removerMembro(created.internalId!, sharedMember.internalId!, reqOwner);
        expect(colleagueUser.tenants.some((t: any) => t.id === created.tenantId)).toBe(false);
        expect(colleagueUser.roles).not.toContain('ORG_AUDITORIA');
    });
});
