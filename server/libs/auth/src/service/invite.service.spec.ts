import { createHash } from 'crypto';
import { InviteController } from '../controller/invite.controller';
import { InviteService } from './invite.service';

describe('InviteController & InviteService (Validação de Convite no Registro)', () => {
  let controller: InviteController;
  let service: InviteService;
  let inviteRepo: any;
  let registerRepo: any;

  beforeEach(() => {
    inviteRepo = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((data) => ({ ...data })),
      save: jest.fn(async (data) => ({ internalId: 'inv-1', ...data })),
    };
    registerRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    const mailer: any = {
      requestSendMessageToMail: jest.fn().mockResolvedValue(undefined),
    };

    service = new InviteService(mailer, inviteRepo, registerRepo);
    controller = new InviteController(service);
  });

  it('deve validar convite enviado no body de POST /Invite/GetInvite por convite, invite ou inviteHash', async () => {
    const hash = 'INVITE-' + 'a'.repeat(64);
    inviteRepo.findOne.mockResolvedValue({
      internalId: 'inv-1',
      email: 'convidado@ci.dev.br',
      friendlyName: 'Convidado',
      inviteHash: hash,
      roles: ['USER', 'ORG_MEMBER'],
      invited: true,
      accepted: false,
    });

    const result = await controller.GetInvite({ invite: hash });
    expect(result).toBeDefined();
    expect(result.email).toBe('convidado@ci.dev.br');
    expect(result.inviteHash).toBe(hash);
    expect(result.roles).toEqual(['USER', 'ORG_MEMBER']);
  });

  it('deve resolver convite originado de authentication.register pelo sha256 de internalId.substring(8)', async () => {
    const regInternalId = '12345678-90ab-cdef-1234-567890abcdef';
    const expectedHash = createHash('sha256').update(regInternalId.substring(8)).digest('hex');

    inviteRepo.findOne.mockResolvedValue(null);
    registerRepo.find.mockResolvedValue([
      { internalId: regInternalId, mail: 'novo@ci.dev.br', deletedAt: null },
    ]);

    const result = await controller.GetInvite({ convite: expectedHash.toUpperCase() });
    expect(result.email).toBe('novo@ci.dev.br');
    expect(result.accepted).toBe(false);
    expect(result.roles).toEqual(['USER']);
  });

  it('deve materializar convite quando informado hash SHA-256 válido (64 hex chars)', async () => {
    const sha = 'b'.repeat(64);
    inviteRepo.findOne.mockResolvedValue(null);

    const result = await service.getInvite(`INVITE-${sha}`);
    expect(result.inviteHash).toBe(`INVITE-${sha}`);
    expect(result.roles).toEqual(['USER']);
  });

  it('deve permitir ADMIN enviar convite vinculado a tenant disponível e bloquear tenant não autorizado ou papel MASTER', async () => {
    const tenantSvc: any = {
      listarTenantsDisponiveis: jest.fn(async () => [
        { id: 'tenant-1', name: 'Tenant 1', permissionsSummary: { canVisualizar: true, canVer: true, canEditar: true, canCompartilhar: true } },
      ]),
    };
    const scopedService = new InviteService(
      { requestSendMessageToMail: jest.fn().mockResolvedValue(undefined) } as any,
      inviteRepo,
      registerRepo,
      tenantSvc,
    );
    const adminUser: any = { id: 'admin-1', roles: ['USER', 'ADMIN'] };

    const ok = await scopedService.sendInvitation(
      { email: 'novo@t1.com', friendlyName: 'Novo', tenantIds: ['tenant-1'], roles: ['USER', 'ADMIN'] },
      adminUser,
    );
    expect(ok.tenantIds).toEqual(['tenant-1']);
    expect(ok.roles).toEqual(['USER', 'ADMIN']);

    await expect(
      scopedService.sendInvitation(
        { email: 'bad@t2.com', tenantIds: ['tenant-externo'] },
        adminUser,
      ),
    ).rejects.toThrow();

    await expect(
      scopedService.sendInvitation(
        { email: 'escalate@t1.com', tenantIds: ['tenant-1'], roles: ['MASTER'] },
        adminUser,
      ),
    ).rejects.toThrow();
  });
});
