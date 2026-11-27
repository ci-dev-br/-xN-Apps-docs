import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserService } from '../service/user.service';
import { jwtConstants } from '../constants';

describe('AuthController & UserService — Verificação e Confirmação de E-mail', () => {
  let controller: AuthController;
  let userService: UserService;
  let userRepo: any;
  let mailService: any;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret,
    });

    userRepo = {
      findOne: jest.fn(),
      create: jest.fn((d) => ({ ...d })),
      save: jest.fn(async (d) => d),
      update: jest.fn(async () => ({ affected: 1 })),
    };

    const photos: any = {
      Sync: jest.fn(async (p) => p),
    };

    userService = new UserService(
      undefined as any,
      userRepo,
      photos,
    );

    mailService = {
      requestSendMessageToMail: jest.fn().mockResolvedValue(undefined),
    };

    controller = new AuthController(
      userService,
      {} as any,
      jwtService,
      {} as any,
      {} as any,
      {} as any,
      mailService,
    );
  });

  it('deve incluir emailVerificado na resposta de POST /auth/Profile', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 'usr-1',
      username: 'paulo',
      email: 'paulo@ci.dev.br',
      emailVerificado: true,
      fullName: 'Paulo',
      surname: 'Paulo',
      roles: ['USER'],
    });

    const res: any = await controller.profile({ user: { id: 'usr-1' } } as any);
    expect(res.emailVerificado).toBe(true);
    expect(res.email).toBe('paulo@ci.dev.br');
  });

  it('deve enviar template HTML de confirmação ao solicitar verificação de e-mail', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 'usr-1',
      username: 'maria',
      email: 'Maria@ci.dev.br',
      emailVerificado: false,
      fullName: 'Maria Silva',
      roles: ['USER'],
    });

    const result = await controller.solicitarVerificacaoEmail(
      { user: { id: 'usr-1' }, headers: { origin: 'https://apps.ci.dev.br' } } as any,
      {},
    );

    expect(result.sent).toBe(true);
    expect(result.alreadyVerified).toBe(false);
    expect(result.email).toBe('maria@ci.dev.br');
    expect((result as any).verificationLink).toBeUndefined();
    expect(mailService.requestSendMessageToMail).toHaveBeenCalledTimes(1);

    const mailCall = mailService.requestSendMessageToMail.mock.calls[0][0];
    expect(mailCall.to).toBe('maria@ci.dev.br');
    expect(mailCall.template_html).toContain('Maria Silva');
    expect(mailCall.template_html).toContain('maria@ci.dev.br');
    expect(mailCall.template_html).toContain('https://apps.ci.dev.br/confirmar-email/');
    expect(mailCall.template_html).toContain('Confirmar Meu E-mail');
  });

  it('não deve reenviar se o e-mail já estiver verificado', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 'usr-1',
      email: 'maria@ci.dev.br',
      emailVerificado: true,
    });

    const result = await controller.solicitarVerificacaoEmail(
      { user: { id: 'usr-1' }, headers: {} } as any,
      {},
    );

    expect(result.sent).toBe(false);
    expect(result.alreadyVerified).toBe(true);
    expect(mailService.requestSendMessageToMail).not.toHaveBeenCalled();
  });

  it('deve validar o token de confirmação e marcar emailVerificado=true no usuário', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 'usr-1',
      email: 'maria@ci.dev.br',
      emailVerificado: false,
      fullName: 'Maria Silva',
    });

    await controller.solicitarVerificacaoEmail(
      { user: { id: 'usr-1' }, headers: { origin: 'https://apps.ci.dev.br' } } as any,
      {},
    );

    const html: string = mailService.requestSendMessageToMail.mock.calls[0][0].template_html;
    const match = html.match(/https:\/\/apps\.ci\.dev\.br\/confirmar-email\/([^"<\s]+)/);
    expect(match).toBeTruthy();
    const token = decodeURIComponent(match![1]);

    const confirmResult = await controller.confirmarEmail({ token });
    expect(confirmResult.verified).toBe(true);
    expect(confirmResult.alreadyVerified).toBe(false);
    expect(confirmResult.email).toBe('maria@ci.dev.br');
    expect(userRepo.update).toHaveBeenCalledWith('usr-1', { emailVerificado: true });
  });

  it('deve rejeitar token inválido ou adulterado', async () => {
    await expect(controller.confirmarEmail({ token: 'token-invalido' }))
      .rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar solicitação sem usuário autenticado', async () => {
    await expect(controller.solicitarVerificacaoEmail({ headers: {} } as any, {}))
      .rejects.toThrow(UnauthorizedException);
  });

  it('deve impedir spoofing de emailVerificado e resetar quando e-mail é alterado no UserService.sync', async () => {
    const dbUser = {
      id: 'usr-1',
      email: 'antigo@ci.dev.br',
      emailVerificado: true,
      photo: null,
    };
    userRepo.findOne.mockResolvedValue(dbUser);

    await userService.sync({
      id: 'usr-1',
      email: 'novo@ci.dev.br',
      emailVerificado: true,
    });

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'usr-1',
        email: 'novo@ci.dev.br',
        emailVerificado: false,
      }),
      { transaction: true },
    );
  });
});
