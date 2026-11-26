import { FileExplorerService } from '../models/file-explorer.service';
import { FilePermission } from '../models/file-permission.entity';
import { FilePermissionService } from './file-permission.service';

describe('FileExplorerService & FilePermissionService', () => {
    function createMockRepo(initial: Partial<FilePermission>[] = []) {
        const items: FilePermission[] = initial.map((item, idx) => ({
            internalId: `perm-${idx + 1}`,
            role: 'DANY',
            ...item,
        } as FilePermission));

        return {
            items,
            create: jest.fn((data: Partial<FilePermission>) => ({ ...data } as FilePermission)),
            save: jest.fn(async (entity: FilePermission) => {
                if (!entity.internalId) {
                    entity.internalId = `perm-${items.length + 1}`;
                    items.push(entity);
                } else {
                    const index = items.findIndex(i => i.internalId === entity.internalId);
                    if (index >= 0) items[index] = entity;
                    else items.push(entity);
                }
                return entity;
            }),
            find: jest.fn(async (opts?: any) => {
                const where = opts?.where;
                if (!where) return [...items];
                const clauses = Array.isArray(where) ? where : [where];
                return items.filter(item =>
                    clauses.some(clause => {
                        if (clause.requestedByUserId && clause.status) {
                            return item.requestedByUserId === clause.requestedByUserId.value &&
                                item.status === clause.status.value;
                        }
                        if (clause.requestedByUserId) {
                            return item.requestedByUserId === clause.requestedByUserId.value;
                        }
                        if (clause.createdBy?.identifiedUser) {
                            return (item.createdBy as any)?.identifiedUser === clause.createdBy.identifiedUser.value;
                        }
                        if (clause.createdBy && clause.requestedByUserId) {
                            return !item.createdBy && !item.requestedByUserId;
                        }
                        return false;
                    })
                );
            }),
            findOne: jest.fn(async (opts?: any) => {
                const where = opts?.where || {};
                return items.find(item => {
                    if (where.requestToken) {
                        return item.requestToken === where.requestToken.value;
                    }
                    if (where.internalId) {
                        return item.internalId === where.internalId.value;
                    }
                    return false;
                }) || null;
            }),
        };
    }

    it('deve enviar e-mail com template e link para usuários SYSADMIN e autorizar pasta pelo token', async () => {
        const mockRepo = createMockRepo();
        const mockSysAdmins = [
            { id: 'sys-1', email: 'sys1@ci.dev.br', fullName: 'SysAdmin Um', username: 'sys1' },
            { id: 'sys-2', email: 'sys2@ci.dev.br', fullName: 'SysAdmin Dois', username: 'sys2' },
        ];
        const mockDataSource: any = {
            getRepository: jest.fn(() => ({
                createQueryBuilder: () => ({
                    where: () => ({
                        getMany: async () => mockSysAdmins,
                    }),
                }),
            })),
        };
        const mockMailService: any = {
            requestSendMessageToMail: jest.fn(async () => undefined),
        };
        const mockGitService: any = {
            status: jest.fn(async () => ({})),
        };

        const permissionService = new FilePermissionService(mockRepo as any, mockDataSource);
        const explorerService = new FileExplorerService(mockGitService, permissionService, mockMailService);

        const req: any = {
            user: {
                id: 'user-req-1',
                email: 'dev@ci.dev.br',
                fullName: 'Solicitante Teste',
                roles: ['SYSADMIN'],
            },
            chaveAcesso: 'cred-1',
            headers: {
                origin: 'https://apps.ci.dev.br',
            },
        };

        // Antes da autorização, grant deve negar
        expect(await permissionService.grant('./libs', req)).toBe(false);
        expect(await explorerService.readDirectory({ path: './libs' }, req)).toBeNull();

        // Solicita permissão
        const requestResult = await explorerService.requestPermission(
            { path: './libs', reason: 'Acesso operacional via Terminal' },
            req,
        );

        expect(requestResult.requested).toBe(true);
        expect(requestResult.status).toBe('PENDING');
        expect(requestResult.sysadminCount).toBe(2);
        expect(requestResult.emailsSent).toBe(2);
        expect(requestResult.requestToken).toBeTruthy();
        expect(requestResult.authorizeLink).toContain('/autorizar-pasta/');
        expect(mockMailService.requestSendMessageToMail).toHaveBeenCalledTimes(2);

        const firstEmailCall = mockMailService.requestSendMessageToMail.mock.calls[0][0];
        expect(firstEmailCall.to).toBe('sys1@ci.dev.br');
        expect(firstEmailCall.template_html).toContain(requestResult.authorizeLink);
        expect(firstEmailCall.template_html).toContain('./libs');
        expect(firstEmailCall.template_html).toContain('Solicitante Teste');

        // Ainda pendente -> continua negado
        expect(await permissionService.grant('./libs', req)).toBe(false);

        // SYSADMIN autoriza via token
        const authResult = await explorerService.authorizePermission(
            { token: requestResult.requestToken, decision: 'GRANT' },
            { user: { id: 'sys-1', roles: ['SYSADMIN'] }, chaveAcesso: 'cred-sys-1' },
        );

        expect(authResult.authorized).toBe(true);
        expect(authResult.status).toBe('GRANTED');

        // Após autorização, grant libera a pasta e subpastas, mas bloqueia pastas irmãs
        expect(await permissionService.grant('./libs', req)).toBe(true);
        expect(await permissionService.grant('./libs/storage', req)).toBe(true);
        expect(await permissionService.grant('./src', req)).toBe(false);
    });
});
