import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { CiApplicationService } from './app.service';
import { clearRegisteredStaticFileCaches, getRegisteredStaticFileCacheStats } from '@ci/core';
import { mkdirSync, rmSync, utimesSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

describe('AppController (Cache Estático)', () => {
  let appController: AppController;
  const testDirName = '__test_static_cache__';
  const publicDir = resolve(__dirname, '../public');
  const testDir = join(publicDir, testDirName);
  const testFileRel = `/${testDirName}/bundle-test.js`;
  const testFileAbs = join(testDir, 'bundle-test.js');

  beforeEach(async () => {
    clearRegisteredStaticFileCaches();
    mkdirSync(testDir, { recursive: true });
    writeFileSync(testFileAbs, 'console.log("v1");', 'utf-8');

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [CiApplicationService],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    appController?.onModuleDestroy();
    clearRegisteredStaticFileCaches();
    rmSync(testDir, { recursive: true, force: true });
  });

  function createMockResponse() {
    const res: any = {
      headers: {} as Record<string, string>,
      headersSent: false,
      statusCode: 200,
      _contentType: undefined as string | undefined,
      _body: undefined as any,
      setHeader: jest.fn((k: string, v: string) => {
        res.headers[k] = v;
      }),
      contentType: jest.fn((ct: string) => {
        res._contentType = ct;
        return res;
      }),
      status: jest.fn((code: number) => {
        res.statusCode = code;
        return res;
      }),
      send: jest.fn((body: any) => {
        res._body = body;
        res.headersSent = true;
        return res;
      }),
      sendFile: jest.fn((filePath: string) => {
        res._sentFile = filePath;
        res.headersSent = true;
        return res;
      }),
    };
    return res;
  }

  it('deve invalidar o cache em memória quando arquivo estático não-index for atualizado no disco', async () => {
    const req1: any = { path: testFileRel, url: testFileRel, headers: {}, query: {} };
    const res1 = createMockResponse();
    await appController.handleAllRequests(req1, res1, jest.fn());

    expect(res1._contentType).toBe('application/javascript');
    expect(Buffer.isBuffer(res1._body) ? res1._body.toString('utf-8') : res1._body).toBe('console.log("v1");');
    expect(appController.getCacheStats().cachedFiles).toBe(1);

    // Atualiza conteúdo e força novo mtime no disco
    writeFileSync(testFileAbs, 'console.log("v2-updated");', 'utf-8');
    const future = new Date(Date.now() + 5000);
    utimesSync(testFileAbs, future, future);

    const req2: any = { path: testFileRel, url: testFileRel, headers: {}, query: {} };
    const res2 = createMockResponse();
    await appController.handleAllRequests(req2, res2, jest.fn());

    expect(Buffer.isBuffer(res2._body) ? res2._body.toString('utf-8') : res2._body).toBe('console.log("v2-updated");');
  });

  it('deve limpar o cache do AppController globalmente via clearRegisteredStaticFileCaches()', async () => {
    const req: any = { path: testFileRel, url: testFileRel, headers: {}, query: {} };
    const res = createMockResponse();
    await appController.handleAllRequests(req, res, jest.fn());

    expect(getRegisteredStaticFileCacheStats().cachedFiles).toBeGreaterThanOrEqual(1);
    const cleared = clearRegisteredStaticFileCaches();
    expect(cleared.clearedEntries).toBeGreaterThanOrEqual(1);
    expect(appController.getCacheStats().cachedFiles).toBe(0);
  });

  it('deve encaminhar rotas /Deployer/* via next() sem cair no fallback estático', async () => {
    const next = jest.fn();
    const req: any = { path: '/Deployer/version', url: '/Deployer/version', headers: { accept: 'application/json' }, query: {} };
    const res = createMockResponse();
    await appController.handleAllRequests(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
