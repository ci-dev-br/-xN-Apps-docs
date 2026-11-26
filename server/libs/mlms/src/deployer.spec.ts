import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const mockChild = {
  pid: 98765,
  unref: jest.fn(),
  stdout: { on: jest.fn() },
  stderr: { on: jest.fn() },
  on: jest.fn(),
};

jest.mock('child_process', () => {
  const actual = jest.requireActual('child_process');
  return {
    ...actual,
    spawn: jest.fn(() => mockChild),
  };
});

import * as childProcess from 'child_process';
import { AuthGuard } from '@ci/auth/auth.guard';
import {
  registerStaticFileCacheHandler,
  unregisterStaticFileCacheHandler,
} from '@ci/core';
import { DeployerController } from './controllers/deployer.controller';
import { DeployerBackdoorServices } from './services/deployer-backdoor.service';

describe('Deployer (DEVELOPER + SYSADMIN, sync apps/dist/apps/browser -> server/public, restart & cache)', () => {
  let service: DeployerBackdoorServices;
  let controller: DeployerController;
  let tempRoot: string;

  beforeEach(() => {
    jest.clearAllMocks();
    tempRoot = mkdtempSync(join(tmpdir(), 'ci-deployer-test-'));
    mkdirSync(join(tempRoot, 'apps', 'dist', 'apps', 'browser', 'assets'), { recursive: true });
    mkdirSync(join(tempRoot, 'server', 'public'), { recursive: true });
    mkdirSync(join(tempRoot, 'server', 'dist'), { recursive: true });
    mkdirSync(join(tempRoot, 'gulp'), { recursive: true });

    service = new DeployerBackdoorServices();
    jest.spyOn<any, any>(service, 'getRepoRoot').mockReturnValue(tempRoot);
    jest.spyOn<any, any>(service, 'isCurrentInstanceDebug').mockReturnValue(true);

    controller = new DeployerController('', '', service);
  });

  afterEach(() => {
    unregisterStaticFileCacheHandler('test-deployer-cache');
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('deve exigir ambos papéis DEVELOPER + SYSADMIN no AuthGuard para @RequireAllRoles e permitir @Role com múltiplos papéis', async () => {
    const reflector = new Reflector();
    const jwtService: any = {
      verifyAsync: jest.fn().mockResolvedValue({
        id: 'u1',
        roles: ['USER'],
        chaveAcesso: 'k1',
      }),
    };
    const credencial: any = {
      obterChaveAcessoPorId: jest.fn().mockResolvedValue({ id: 'k1', alive: true, valid: true }),
    };

    let currentDbRoles: string[] = ['DEVELOPER'];
    const userService: any = {
      findByIdLight: jest.fn(async () => ({ id: 'u1', roles: [...currentDbRoles] })),
    };

    const guard = new AuthGuard(jwtService, reflector, credencial, userService);

    const makeCtx = (handlerName: keyof DeployerController): ExecutionContext => {
      const handler = DeployerController.prototype[handlerName];
      const req: any = {
        headers: { host: 'localhost:86', authorization: 'Bearer tok-1' },
        url: `/Deployer/${String(handlerName)}`,
      };
      return {
        getHandler: () => handler,
        getClass: () => DeployerController,
        switchToHttp: () => ({ getRequest: () => req }),
      } as any;
    };

    // Apenas DEVELOPER: pode consultar getVersion (@Role('DEVELOPER', 'SYSADMIN')), mas NÃO publicar (@RequireAllRoles)
    await expect(guard.canActivate(makeCtx('getVersion'))).resolves.toBe(true);
    await expect(guard.canActivate(makeCtx('publish'))).rejects.toThrow(UnauthorizedException);

    // Apenas SYSADMIN: também não pode publicar sem DEVELOPER
    currentDbRoles = ['SYSADMIN'];
    await expect(guard.canActivate(makeCtx('getVersion'))).resolves.toBe(true);
    await expect(guard.canActivate(makeCtx('restartService'))).rejects.toThrow(UnauthorizedException);

    // DEVELOPER + SYSADMIN: autorizado para publicar e reiniciar
    currentDbRoles = ['DEVELOPER', 'SYSADMIN'];
    await expect(guard.canActivate(makeCtx('publish'))).resolves.toBe(true);
    await expect(guard.canActivate(makeCtx('syncPublic'))).resolves.toBe(true);
    await expect(guard.canActivate(makeCtx('clearCache'))).resolves.toBe(true);
    await expect(guard.canActivate(makeCtx('restartService'))).resolves.toBe(true);
  });

  it('deve bloquear no controller ações de produção se faltarem DEVELOPER ou SYSADMIN', async () => {
    await expect(
      controller.publish({ action: 'sync-public' }, { user: { roles: ['DEVELOPER'] } }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      controller.restartService({ user: { roles: ['SYSADMIN'] } }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve atualizar server/public a partir de apps/dist/apps/browser, remover chunks antigos e limpar cache do AppController', async () => {
    // Bundles antigos em server/public e arquivo auxiliar preservado
    writeFileSync(join(tempRoot, 'server', 'public', 'chunk-OLD12345.js'), 'old', 'utf-8');
    writeFileSync(join(tempRoot, 'server', 'public', 'main-OLD12345.js'), 'old', 'utf-8');
    writeFileSync(join(tempRoot, 'server', 'public', '.htaccess'), 'RewriteEngine On', 'utf-8');

    // Novos arquivos em apps/dist/apps/browser
    writeFileSync(join(tempRoot, 'apps', 'dist', 'apps', 'browser', 'index.csr.html'), '<html>new</html>', 'utf-8');
    writeFileSync(join(tempRoot, 'apps', 'dist', 'apps', 'browser', 'main-NEW99999.js'), 'new-main', 'utf-8');
    writeFileSync(join(tempRoot, 'apps', 'dist', 'apps', 'browser', 'assets', 'app.css'), 'body{}', 'utf-8');

    const clearCacheSpy = jest.fn(() => ({ clearedEntries: 4 }));
    registerStaticFileCacheHandler('test-deployer-cache', {
      clearCache: clearCacheSpy,
      getCacheStats: () => ({ cachedFiles: 4, keys: ['a', 'b', 'c', 'd'] }),
    });

    const result = await controller.syncPublic({
      combinedRoles: ['DEVELOPER', 'SYSADMIN'],
    });

    expect(result.status).toBe('success');
    expect(existsSync(join(tempRoot, 'server', 'public', 'chunk-OLD12345.js'))).toBe(false);
    expect(existsSync(join(tempRoot, 'server', 'public', 'main-OLD12345.js'))).toBe(false);
    expect(existsSync(join(tempRoot, 'server', 'public', '.htaccess'))).toBe(true);
    expect(existsSync(join(tempRoot, 'server', 'public', 'index.csr.html'))).toBe(true);
    expect(existsSync(join(tempRoot, 'server', 'public', 'main-NEW99999.js'))).toBe(true);
    expect(existsSync(join(tempRoot, 'server', 'public', 'assets', 'app.css'))).toBe(true);
    expect(clearCacheSpy).toHaveBeenCalledTimes(1);
  });

  it('deve limpar o cache do AppController e spawnar nova instância dist/main.js ao reiniciar o serviço', async () => {
    writeFileSync(join(tempRoot, 'server', 'dist', 'main.js'), 'console.log("ok");', 'utf-8');
    const clearCacheSpy = jest.fn(() => ({ clearedEntries: 7 }));
    registerStaticFileCacheHandler('test-deployer-cache', {
      clearCache: clearCacheSpy,
      getCacheStats: () => ({ cachedFiles: 7, keys: [] }),
    });

    const res = await controller.restartService({
      combinedRoles: ['DEVELOPER', 'SYSADMIN'],
    });

    expect(res.status).toBe('restarting');
    expect(clearCacheSpy).toHaveBeenCalledTimes(1);
    expect(childProcess.spawn).toHaveBeenCalledWith(
      'node',
      ['dist/main.js'],
      expect.objectContaining({
        cwd: join(tempRoot, 'server'),
        detached: true,
        stdio: 'ignore',
      }),
    );
    expect(mockChild.unref).toHaveBeenCalled();
  });
});
