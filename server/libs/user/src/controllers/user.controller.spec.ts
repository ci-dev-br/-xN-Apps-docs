import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '@ci/auth/service/user.service';
import { User } from '@ci/auth/models/user.entity';
import { Tenant } from '@ci/tenant/models/tenant.entity';

describe('UserController & UserService — Gerenciamento de Usuários por ADMIN (Tenants disponíveis) e MASTER', () => {
  let controller: UserController;
  let userService: UserService;
  let userRepo: any;
  let tenantService: any;
  let dataSource: any;

  const tenantA: Tenant = { id: 'tenant-a', name: 'Tenant A' } as Tenant;
  const tenantB: Tenant = { id: 'tenant-b', name: 'Tenant B' } as Tenant;
  const tenantC: Tenant = { id: 'tenant-c', name: 'Tenant C' } as Tenant;

  let usersDb: User[];

  beforeEach(() => {
    usersDb = [
      {
        id: 'master-1',
        username: 'master',
        fullName: 'Master Global',
        email: 'master@ci.dev.br',
        roles: ['USER', 'MASTER'],
        tenants: [tenantA],
        password: 'hashed-password',
        refreshToken: 'secret-refresh',
      },
      {
        id: 'admin-1',
        username: 'admin.a',
        fullName: 'Admin A',
        email: 'admin@ci.dev.br',
        roles: ['USER', 'ADMIN'],
        tenants: [tenantA],
      },
      {
        id: 'user-a',
        username: 'maria.a',
        fullName: 'Maria Silva',
        email: 'maria@a.com',
        roles: ['USER'],
        tenants: [tenantA],
      },
      {
        id: 'user-ab',
        username: 'carlos.ab',
        fullName: 'Carlos Dual',
        email: 'carlos@ab.com',
        roles: ['USER'],
        tenants: [tenantA, tenantC],
      },
      {
        id: 'user-b',
        username: 'joao.b',
        fullName: 'João Externo',
        email: 'joao@b.com',
        roles: ['USER'],
        tenants: [tenantB],
      },
    ];

    userRepo = {
      find: jest.fn(async () => usersDb.map((u) => ({ ...u, tenants: [...(u.tenants || [])] }))),
      findOne: jest.fn(async ({ where }: any) => {
        const clauses = Array.isArray(where) ? where : [where];
        const found = usersDb.find((u) =>
          clauses.some(
            (c) =>
              (c.id && u.id === c.id) ||
              (c.email && u.email?.toLowerCase() === String(c.email).toLowerCase()) ||
              (c.username && u.username === c.username),
          ),
        );
        return found ? { ...found, tenants: [...(found.tenants || [])] } : null;
      }),
      create: jest.fn((data: any) => ({ id: `created-${usersDb.length + 1}`, ...data })),
      save: jest.fn(async (entity: User) => {
        const idx = usersDb.findIndex((u) => u.id === entity.id);
        if (idx >= 0) {
          usersDb[idx] = { ...entity };
        } else {
          usersDb.push({ ...entity });
        }
        return entity;
      }),
    };

    const tenantRepo = {
      find: jest.fn(async ({ where }: any) => {
        const ids: string[] = where?.id?._value || [];
        return [tenantA, tenantB, tenantC].filter((t) => ids.includes(t.id!));
      }),
    };

    dataSource = {
      getRepository: jest.fn(() => tenantRepo),
      query: jest.fn(async () => [{ id: 'app-loja' }]),
    };

    tenantService = {
      listarTenantsDisponiveis: jest.fn(async (actor: User) => {
        if (actor.id === 'admin-1') {
          return [{ ...tenantA, permissionsSummary: { canVisualizar: true, canVer: true, canEditar: true, canCompartilhar: true } }];
        }
        return [];
      }),
    };

    userService = new UserService(dataSource, userRepo, undefined as any, tenantService);
    controller = new UserController(userService);
  });

  it('permite que ADMIN liste apenas usuários dos tenants disponíveis para ele sem vazar tenants externos ou credenciais', async () => {
    const req = { user: usersDb.find((u) => u.id === 'admin-1') };
    const result = await controller.getList(req, {});

    const ids = (result || []).map((u) => u.id);
    expect(ids).toContain('admin-1');
    expect(ids).toContain('user-a');
    expect(ids).toContain('user-ab');
    expect(ids).not.toContain('user-b');

    const dualUser = result?.find((u) => u.id === 'user-ab');
    expect(dualUser?.tenants?.map((t) => t.id)).toEqual(['tenant-a']);
    const masterRow = result?.find((u) => u.id === 'master-1');
    expect(masterRow?.password).toBeUndefined();
    expect(masterRow?.refreshToken).toBeUndefined();
  });

  it('bloqueia ADMIN ao solicitar explicitamente um tenant fora da sua lista disponível', async () => {
    const req = { user: usersDb.find((u) => u.id === 'admin-1') };
    await expect(controller.getList(req, { tenantIds: ['tenant-b'] })).rejects.toThrow(ForbiddenException);
  });

  it('permite que MASTER liste usuários globalmente e filtre opcionalmente por tenantIds', async () => {
    const req = { user: usersDb.find((u) => u.id === 'master-1') };
    const all = await controller.getList(req, {});
    expect(all?.map((u) => u.id)).toContain('user-b');

    const onlyB = await controller.getList(req, { tenantIds: ['tenant-b'] });
    expect(onlyB?.map((u) => u.id)).toEqual(['user-b']);
  });

  it('nega listagem para usuário sem papel ADMIN ou MASTER', async () => {
    const req = { user: usersDb.find((u) => u.id === 'user-a') };
    await expect(controller.getList(req, {})).rejects.toThrow(ForbiddenException);

    await expect(controller.getList({ user: undefined }, {})).rejects.toThrow(UnauthorizedException);
  });

  it('permite que ADMIN edite usuário do seu tenant, promova a ADMIN e preserve tenants externos fora do seu escopo', async () => {
    const req = { user: usersDb.find((u) => u.id === 'admin-1') };
    const updated = await controller.sync(req, {
      id: 'user-ab',
      fullName: 'Carlos Atualizado',
      roles: ['USER', 'ADMIN'],
      tenants: [{ id: 'tenant-a' }],
    });

    expect(updated?.fullName).toBe('Carlos Atualizado');
    expect(updated?.roles).toEqual(['USER', 'ADMIN']);
    const stored = usersDb.find((u) => u.id === 'user-ab');
    expect(stored?.tenants?.map((t) => t.id).sort()).toEqual(['tenant-a', 'tenant-c']);
  });

  it('impede ADMIN de editar usuário de outro tenant, editar MASTER ou atribuir role MASTER', async () => {
    const req = { user: usersDb.find((u) => u.id === 'admin-1') };

    await expect(
      controller.sync(req, { id: 'user-b', fullName: 'Invasor' }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      controller.sync(req, { id: 'master-1', fullName: 'Alterar Master' }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      controller.sync(req, { id: 'user-a', roles: ['USER', 'MASTER'] }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite que ADMIN vincule e desvincule usuário existente dentro de seu tenant disponível', async () => {
    const req = { user: usersDb.find((u) => u.id === 'admin-1') };

    const linked = await controller.addToTenant(req, {
      tenantId: 'tenant-a',
      emailOrUsername: 'joao@b.com',
    });
    expect(linked.tenants?.map((t) => t.id)).toEqual(['tenant-a']);
    expect(usersDb.find((u) => u.id === 'user-b')?.tenants?.map((t) => t.id).sort()).toEqual([
      'tenant-a',
      'tenant-b',
    ]);

    const unlinked = await controller.removeFromTenant(req, {
      tenantId: 'tenant-a',
      userId: 'user-b',
    });
    expect(unlinked.tenants).toEqual([]);
    expect(usersDb.find((u) => u.id === 'user-b')?.tenants?.map((t) => t.id)).toEqual(['tenant-b']);
  });
});
