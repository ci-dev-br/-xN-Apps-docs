import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@ci/portal-api';
import { of, throwError } from 'rxjs';
import { authGuard } from './auth.guard';
import { StorageService } from '../storage/storage.service';
import { USER_STORE_KEY, encodeBase64Utf8 } from './client-session-storage';

function makeJwt(payload: Record<string, any>): string {
  const header = encodeBase64Utf8(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Utf8(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let storage: StorageService;
  let authServiceMock: any;

  beforeEach(() => {
    localStorage.clear();
    authServiceMock = {
      profile: jasmine.createSpy('profile'),
    };
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('deve bloquear e limpar storage quando não houver token válido', async () => {
    const expiredJwt = makeJwt({ id: 'u1', exp: Math.floor(Date.now() / 1000) - 60 });
    storage.store(USER_STORE_KEY, {
      authentication: { bearer: expiredJwt, refreshToken: expiredJwt, chaveAcesso: 'cred-1' },
    });

    const allowed = await executeGuard({} as any, {} as any);
    expect(allowed).toBeFalse();
    expect(storage.restore(USER_STORE_KEY)).toBeUndefined();
    expect(authServiceMock.profile).not.toHaveBeenCalled();
  });

  it('deve bloquear quando /auth/Profile retornar sem id em vez de permitir passagem', async () => {
    const validJwt = makeJwt({ id: 'u1', chaveAcesso: 'cred-1', exp: Math.floor(Date.now() / 1000) + 600 });
    storage.store(USER_STORE_KEY, {
      authentication: { bearer: validJwt, chaveAcesso: 'cred-1' },
    });
    authServiceMock.profile.and.returnValue(of({ status: 500, message: 'Falha' }));

    const allowed = await executeGuard({} as any, {} as any);
    expect(allowed).toBeFalse();
    expect(storage.restore(USER_STORE_KEY)).toBeUndefined();
  });

  it('deve permitir acesso quando /auth/Profile retornar usuário válido', async () => {
    const validJwt = makeJwt({ id: 'u1', chaveAcesso: 'cred-1', exp: Math.floor(Date.now() / 1000) + 600 });
    storage.store(USER_STORE_KEY, {
      authentication: { bearer: validJwt, chaveAcesso: 'cred-1' },
    });
    authServiceMock.profile.and.returnValue(of({ id: 'u1', username: 'paulo' }));

    const allowed = await executeGuard({} as any, {} as any);
    expect(allowed).toBeTrue();
  });

  it('deve limpar storage e bloquear quando /auth/Profile falhar com erro HTTP', async () => {
    const validJwt = makeJwt({ id: 'u1', chaveAcesso: 'cred-1', exp: Math.floor(Date.now() / 1000) + 600 });
    storage.store(USER_STORE_KEY, {
      authentication: { bearer: validJwt, chaveAcesso: 'cred-1' },
    });
    authServiceMock.profile.and.returnValue(throwError(() => ({ status: 401 })));

    const allowed = await executeGuard({} as any, {} as any);
    expect(allowed).toBeFalse();
    expect(storage.restore(USER_STORE_KEY)).toBeUndefined();
  });
});
