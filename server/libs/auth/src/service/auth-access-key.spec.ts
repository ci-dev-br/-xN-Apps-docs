import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from '../controller/auth.controller';
import { jwtConstants } from '../constants';

describe('AuthService & AuthController — Estratégia de Chave de Acesso e Refresh Token', () => {
  let jwtService: JwtService;
  let credencialService: any;
  let userService: any;
  let authService: AuthService;
  let controller: AuthController;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret,
    });

    credencialService = {
      obterChaveAcessoPorId: jest.fn(),
      atualizar: jest.fn(async (c) => c),
      registrarChavePublica: jest.fn((c, pk, alg) => {
        c.publicKey = pk;
        c.publicKeyAlgorithm = alg || 'ECDSA-P256-SHA256';
        return c;
      }),
      desconectarDispositivo: jest.fn().mockResolvedValue(true),
    };

    userService = {
      findByIdLight: jest.fn().mockResolvedValue({
        id: 'usr-1',
        roles: ['USER'],
      }),
      logout: jest.fn(),
    };

    authService = new AuthService(
      userService,
      {} as any,
      jwtService,
      credencialService,
    );

    controller = new AuthController(
      userService,
      credencialService,
      jwtService,
      authService,
      {} as any,
      {} as any,
    );
  });

  it('deve preservar a mesma chaveAcesso e rotacionar refreshToken mantendo publicKey existente', async () => {
    const refreshToken = await jwtService.signAsync(
      { userId: 'usr-1', chaveAcesso: 'cred-1', permission: 'perm-1' },
      { expiresIn: '1d' },
    );

    const storedCred: any = {
      id: 'cred-1',
      identifiedUser: 'usr-1',
      valid: true,
      alive: true,
      publicKey: 'ORIGINAL_PUB_KEY',
    };
    credencialService.obterChaveAcessoPorId.mockResolvedValue(storedCred);

    const out = await authService.refreshToken(
      undefined,
      refreshToken,
      { headers: {} } as any,
      '127.0.0.1',
      'cred-1',
      'ATTEMPTED_OVERWRITE_PUB_KEY',
      'ECDSA-P256-SHA256',
    );

    expect(out.chaveAcesso).toBe('cred-1');
    expect(out.authorization).toBeTruthy();
    expect(out.refreshToken).toBeTruthy();
    expect(credencialService.registrarChavePublica).not.toHaveBeenCalled();

    const decodedAuth: any = jwtService.decode(out.authorization);
    expect(decodedAuth.chaveAcesso).toBe('cred-1');
    expect(decodedAuth.id).toBe('usr-1');

    const decodedRefresh: any = jwtService.decode(out.refreshToken);
    expect(decodedRefresh.chaveAcesso).toBe('cred-1');
    expect(decodedRefresh.userId).toBe('usr-1');
  });

  it('deve rejeitar refresh quando a chaveAcesso foi revogada (alive=false ou valid=false)', async () => {
    const refreshToken = await jwtService.signAsync(
      { userId: 'usr-1', chaveAcesso: 'cred-revoked', permission: 'perm-1' },
      { expiresIn: '1d' },
    );

    credencialService.obterChaveAcessoPorId.mockResolvedValue({
      id: 'cred-revoked',
      identifiedUser: 'usr-1',
      valid: false,
      alive: false,
    });

    await expect(
      authService.refreshToken(undefined, refreshToken, { headers: {} } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve propagar UnauthorizedException (HTTP 401) em AuthController.refresh quando refreshToken for inválido', async () => {
    const resMock: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await expect(
      controller.refresh(
        { headers: {} } as any,
        resMock,
        { refreshToken: 'token-invalido', chaveAcesso: 'cred-1' },
        '127.0.0.1',
      ),
    ).rejects.toThrow(UnauthorizedException);
    expect(resMock.json).not.toHaveBeenCalled();
  });

  it('deve revogar a chaveAcesso atual no endpoint AuthController.logout', async () => {
    const result = await controller.logout({
      user: { id: 'usr-1' },
      chaveAcesso: 'cred-1',
    });

    expect(credencialService.desconectarDispositivo).toHaveBeenCalledWith('usr-1', 'cred-1');
    expect(result).toEqual({ success: true });
  });
});
