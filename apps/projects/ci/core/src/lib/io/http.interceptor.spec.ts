import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@ci/portal-api';
import { of } from 'rxjs';
import { AuthorizationHttpInterceptor } from './http.interceptor';
import { StorageService } from '../storage/storage.service';
import { CORE_ENV } from '../provider';
import { AccessKeyCryptoService } from '../auth/access-key-crypto.service';
import {
  ACCOUNTS_STORAGE_KEY,
  USER_STORE_KEY,
  encodeBase64Utf8,
  readAccountsFromStorage,
} from '../auth/client-session-storage';

function makeJwt(payload: Record<string, any>): string {
  const header = encodeBase64Utf8(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Utf8(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('AuthorizationHttpInterceptor — Refresh, Chave de Acesso e Assinatura', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let storage: StorageService;
  let authServiceMock: any;
  let routerMock: any;
  let cryptoMock: any;

  beforeEach(() => {
    localStorage.clear();
    authServiceMock = {
      refresh: jasmine.createSpy('refresh'),
    };
    routerMock = {
      url: '/Painel',
      navigate: jasmine.createSpy('navigate'),
    };
    cryptoMock = {
      isSupported: true,
      signSnapshot: jasmine.createSpy('signSnapshot').and.resolveTo({
        chaveAcesso: 'cred-1',
        payloadHash: 'abc',
        hash: 'def',
        signature: 'sig-1',
        signedAt: '2026-11-26T23:00:00.000Z',
        algorithm: 'ECDSA-P256-SHA256',
      }),
      deleteKey: jasmine.createSpy('deleteKey').and.resolveTo(undefined),
      clearAllKeys: jasmine.createSpy('clearAllKeys').and.resolveTo(undefined),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StorageService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AccessKeyCryptoService, useValue: cryptoMock },
        { provide: CORE_ENV, useValue: { rootApi: 'https://apps.ci.dev.br' } },
        { provide: HTTP_INTERCEPTORS, useClass: AuthorizationHttpInterceptor, multi: true },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve sincronizar novo bearer e refreshToken em apps.ci.dev.br.store.User e CI_ACCOUNTS durante refresh proativo', (done) => {
    const soonExpiringBearer = makeJwt({
      id: 'u1',
      chaveAcesso: 'cred-1',
      exp: Math.floor(Date.now() / 1000) + 15,
    });
    const validRefresh = makeJwt({
      userId: 'u1',
      chaveAcesso: 'cred-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const freshBearer = makeJwt({
      id: 'u1',
      chaveAcesso: 'cred-1',
      exp: Math.floor(Date.now() / 1000) + 900,
    });
    const rotatedRefresh = makeJwt({
      userId: 'u1',
      chaveAcesso: 'cred-1',
      exp: Math.floor(Date.now() / 1000) + 86400,
    });

    storage.store(USER_STORE_KEY, {
      authentication: {
        bearer: soonExpiringBearer,
        refreshToken: validRefresh,
        chaveAcesso: 'cred-1',
      },
    });
    localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      encodeBase64Utf8(JSON.stringify([{
        id: 'u1',
        isActive: true,
        user: { id: 'u1', username: 'paulo' },
        authentication: {
          bearer: soonExpiringBearer,
          refreshToken: validRefresh,
          chaveAcesso: 'cred-1',
        },
      }])),
    );

    authServiceMock.refresh.and.returnValue(of({
      authorization: freshBearer,
      refreshToken: rotatedRefresh,
      chaveAcesso: 'cred-1',
    }));

    http.get('https://apps.ci.dev.br/Teste').subscribe(() => {
      const updatedStore = storage.restore(USER_STORE_KEY);
      expect(updatedStore.authentication.bearer).toBe(freshBearer);
      expect(updatedStore.authentication.refreshToken).toBe(rotatedRefresh);

      const updatedAccounts = readAccountsFromStorage();
      expect(updatedAccounts[0].authentication.bearer).toBe(freshBearer);
      expect(updatedAccounts[0].authentication.refreshToken).toBe(rotatedRefresh);
      done();
    });

    setTimeout(() => {
      const req = httpMock.expectOne('https://apps.ci.dev.br/Teste');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${freshBearer}`);
      expect(req.request.headers.get('X-Access-Key')).toBe('cred-1');
      req.flush({ ok: true });
    });
  });

  it('deve assinar requisições /Sync com a chave privada do acesso e enviar headers de snapshot', (done) => {
    const validBearer = makeJwt({
      id: 'u1',
      chaveAcesso: 'cred-1',
      exp: Math.floor(Date.now() / 1000) + 900,
    });
    storage.store(USER_STORE_KEY, {
      authentication: {
        bearer: validBearer,
        chaveAcesso: 'cred-1',
      },
    });

    http.post('https://apps.ci.dev.br/Cadastro/Sync', { data: { nome: 'Teste' } }).subscribe(() => {
      expect(cryptoMock.signSnapshot).toHaveBeenCalledWith('cred-1', { nome: 'Teste' });
      done();
    });

    setTimeout(() => {
      const req = httpMock.expectOne('https://apps.ci.dev.br/Cadastro/Sync');
      expect(req.request.headers.get('X-Access-Key')).toBe('cred-1');
      expect(req.request.headers.get('X-Snapshot-Hash')).toBe('def');
      expect(req.request.headers.get('X-Snapshot-Signature')).toBe('sig-1');
      expect(req.request.headers.get('X-Snapshot-Algorithm')).toBe('ECDSA-P256-SHA256');
      req.flush({ ok: true });
    });
  });

  it('deve limpar sessão e redirecionar para /acessar quando /auth/Refresh responder HTTP 200 com status 401', (done) => {
    const validBearer = makeJwt({
      id: 'u1',
      chaveAcesso: 'cred-1',
      exp: Math.floor(Date.now() / 1000) + 900,
    });
    const validRefresh = makeJwt({
      userId: 'u1',
      chaveAcesso: 'cred-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    storage.store(USER_STORE_KEY, {
      authentication: {
        bearer: validBearer,
        refreshToken: validRefresh,
        chaveAcesso: 'cred-1',
      },
    });

    authServiceMock.refresh.and.returnValue(of({ status: 401, message: 'Falha' }));

    http.get('https://apps.ci.dev.br/Protegido').subscribe({
      next: () => fail('Não deveria completar com sucesso'),
      error: (err) => {
        expect(err.status).toBe(401);
        expect(storage.restore(USER_STORE_KEY)).toBeUndefined();
        expect(cryptoMock.deleteKey).toHaveBeenCalledWith('cred-1');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/acessar'], {
          queryParams: { redirect: '/Painel' },
        });
        done();
      },
    });

    const req = httpMock.expectOne('https://apps.ci.dev.br/Protegido');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
