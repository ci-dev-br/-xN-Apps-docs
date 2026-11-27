import { BadRequestException, Body, Controller, Get, HttpException, InternalServerErrorException, Ip, Optional, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import {
  AcessoPayload,
  AuthorizationOutput,
  ConfirmarEmailInputDto,
  ConfirmarEmailOutputDto,
  RefreshPayloadInputDto,
  RegistrarInputDto,
  SolicitarVerificacaoEmailInputDto,
  SolicitarVerificacaoEmailOutputDto,
} from './dto/dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { User } from '../models/user.entity';
import { Public } from '../decorators/public.decorator';
import { CredencialService } from '../service/credencial.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { AuthService } from '../service/auth.service';
import { Request, Response } from 'express';
import { TwoFactorAuthenticationService } from '../service/two-factors.service';
import { InviteService } from '../service/invite.service';
import { BusService } from '@ci/core';
import { templateHtml } from '@ci/core/template/load-template.fn';
import { MailService } from '@ci/notification/services/mail.service';
import { jwtConstants } from '../constants';
import * as argon2 from 'argon2';
const sharp = require('sharp');

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly credencialService: CredencialService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly inviteService: InviteService,
    @Optional() private readonly mailService?: MailService,
  ) { }
  @Public()
  @Post('Registrar')
  @ApiOperation({ operationId: 'RegistrarAuth' })
  @ApiResponse({
    type: User
  })
  async registrar(
    @Ip() ip: string,
    @Req() req: Request,
    @Body() input?: RegistrarInputDto,
  ) {
    try {
      if (!input) {
        throw new BadRequestException('Dados de cadastro não fornecidos.');
      }

      const inviteCode = (input.invite || input.convite || '').trim();
      let inviteData: any = null;
      if (inviteCode) {
        inviteData = await this.inviteService.getInvite(inviteCode);
        if (inviteData?.accepted) {
          throw new BadRequestException('Este convite já foi utilizado para cadastro.');
        }
      }

      const email = (input.email || inviteData?.email || '').trim().toLowerCase();
      const phone = (input.phone || '').trim() || undefined;
      if (!email && !phone) {
        throw new BadRequestException('Informe um e-mail ou telefone válido para o cadastro.');
      }

      const fullName = (input.fullName || inviteData?.friendlyName || email.split('@')[0] || 'Usuário').trim();
      const surname = (input.surname || fullName.split(' ')[0] || fullName).trim();
      const rawUsername = (input.identificacao || email.split('@')[0] || `user_${Date.now()}`)
        .trim()
        .replace(/\s+/g, '.');

      const assignedRoles: string[] = Array.isArray(inviteData?.roles) && inviteData.roles.length > 0
        ? Array.from(new Set(['USER', ...inviteData.roles]))
        : ['USER'];

      const rawPassword = input.password || randomUUID();
      const hashedPassword = await argon2.hash(rawPassword);

      const created_user = await this.userService.registrar({
        email: email || undefined,
        fullName,
        emailVerificado: Boolean(inviteData),
        surname,
        password: hashedPassword,
        username: rawUsername,
        phone,
        passwordMode: 'argon2',
        roles: assignedRoles,
        tenants: Array.isArray(inviteData?.tenantIds) && inviteData.tenantIds.length > 0
          ? inviteData.tenantIds.map((id: string) => ({ id } as any))
          : undefined,
      });

      // Marca o convite como aceito
      if (inviteCode || email) {
        await this.inviteService.markInviteAccepted(inviteCode, email);
      }

      // Cria sessão autenticada para login imediato após conclusão do cadastro
      let authSession: any = {};
      try {
        let chave = await this.credencialService.solicitarCredencial({
          ip: ip || req.ip,
          headers: req.headers as any,
        });
        if (chave && created_user?.id) {
          chave.identifiedUser = created_user.id;
          chave.valid = true;
          chave.alive = true;
          if (input?.publicKey) {
            this.credencialService.registrarChavePublica(chave, input.publicKey, input.publicKeyAlgorithm);
          }
          chave = await this.credencialService.atualizar(chave);

          const permission_uuid = randomUUID();
          const refresh_token = await this.jwtService.signAsync(
            {
              userId: created_user.id,
              chaveAcesso: chave.id,
              permission: permission_uuid,
              try: btoa(JSON.stringify({
                permission: permission_uuid,
                chaveAcesso: chave.id,
                userId: created_user.id
              }, null, 2))
            },
            { expiresIn: '1d' },
          );
          await this.userService.updateRefreshToken(created_user.id, permission_uuid);

          const bearer = await this.jwtService.signAsync({
            id: created_user.id,
            roles: created_user.roles || ['USER'],
            permission: permission_uuid,
            chaveAcesso: chave.id,
          });

          authSession = {
            chaveAcesso: chave.id,
            bearer,
            refreshToken: refresh_token,
          };
        }
      } catch (sessionErr) {
        console.warn('[AuthController.registrar] Aviso ao criar sessão automática:', sessionErr);
      }

      const { password, refreshToken, ...safeUser } = created_user as any;
      return {
        ...safeUser,
        user: safeUser,
        ...authSession,
        activeApps: ['Loja'],
      };
    } catch (error: any) {
      console.trace(error);
      throw error;
    }
  }
  @Post('Profile')
  @ApiOperation({ operationId: 'ProfileAuth' })
  @ApiResponse({
    type: User
  })
  async profile(
    @Req() req: Request,
  ) {
    try {
      let { refreshToken, password, ...user } = await this.userService.findById((req as any)?.user?.id);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerificado: Boolean(user.emailVerificado),
        phone: user.phone,
        fullName: user.fullName,
        surname: user.surname || user.fullName || user.username || user.email,
        photo: {
          /*   originalFile: user.photo.originalFile,
            format: user.photo.format */
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: (user.roles && user.roles.length > 0) ? user.roles : ['USER'],
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.trace(error);
      throw new InternalServerErrorException('Falha ao obter perfil do usuário.');
    }
  }

  /**
   * Solicita o envio de e-mail de verificação para o usuário autenticado.
   */
  @Post('SolicitarVerificacaoEmail')
  @ApiOperation({ operationId: 'SolicitarVerificacaoEmailAuth' })
  @ApiResponse({ type: SolicitarVerificacaoEmailOutputDto })
  async solicitarVerificacaoEmail(
    @Req() req: Request,
    @Body() input?: SolicitarVerificacaoEmailInputDto,
  ): Promise<SolicitarVerificacaoEmailOutputDto> {
    const userId = (req as any)?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    const targetEmail = (user.email || '').trim().toLowerCase();
    if (!targetEmail) {
      throw new BadRequestException('Nenhum endereço de e-mail cadastrado no perfil.');
    }

    if (user.emailVerificado) {
      return {
        sent: false,
        alreadyVerified: true,
        email: targetEmail,
        message: 'Este endereço de e-mail já está verificado.',
      };
    }

    const secret = process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret;
    const verificationToken = await this.jwtService.signAsync(
      {
        purpose: 'email-verification',
        userId: user.id,
        email: targetEmail,
      },
      {
        secret,
        expiresIn: '24h',
      },
    );

    const originHeader = (req as any)?.headers?.origin;
    const refererHeader = (req as any)?.headers?.referer;
    let refererOrigin: string | undefined;
    if (refererHeader) {
      try {
        refererOrigin = new URL(refererHeader).origin;
      } catch {
        refererOrigin = undefined;
      }
    }
    const baseUrl = (input?.originUrl || originHeader || refererOrigin || 'https://apps.ci.dev.br')
      .trim()
      .replace(/\/+$/, '');
    const verificationLink = `${baseUrl}/confirmar-email/${encodeURIComponent(verificationToken)}`;
    const displayName = user.fullName || user.surname || user.username || targetEmail;
    const ano = String(new Date().getFullYear());

    const html = templateHtml('email-verificacao-template', {
      nome: displayName,
      email: targetEmail,
      verification_link: verificationLink,
      expiracao_horas: '24 horas',
      mail_sender_status: 'Verificação oficial de e-mail — apps.ci.dev.br',
      new_report_link: `${baseUrl}/suporte/novo?assunto=Problema%20na%20verificacao%20de%20e-mail`,
      ano,
      footer_assinatura: 'ci.dev.br',
      footer_message: 'Apps, seus aplicativos',
    });

    if (this.mailService) {
      await this.mailService.requestSendMessageToMail({
        to: targetEmail,
        subject: 'Confirme seu endereço de e-mail — apps.ci.dev.br',
        template_html: html,
        message_text: `Olá ${displayName}, confirme seu endereço de e-mail (${targetEmail}) acessando: ${verificationLink}`,
      });
    }

    return {
      sent: true,
      alreadyVerified: false,
      email: targetEmail,
      message: `E-mail de confirmação enviado para ${targetEmail}.`,
    };
  }

  /**
   * Valida o token de verificação e marca o e-mail do usuário como verificado.
   */
  @Public()
  @Post('ConfirmarEmail')
  @ApiOperation({ operationId: 'ConfirmarEmailAuth' })
  @ApiResponse({ type: ConfirmarEmailOutputDto })
  async confirmarEmail(
    @Body() input: ConfirmarEmailInputDto,
  ): Promise<ConfirmarEmailOutputDto> {
    const rawToken = (input?.token || '').trim();
    if (!rawToken) {
      throw new BadRequestException('Token de confirmação de e-mail não informado.');
    }

    const secret = process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret;
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(rawToken, { secret });
    } catch {
      throw new BadRequestException('Link de confirmação inválido ou expirado. Solicite um novo e-mail em /Profile.');
    }

    if (payload?.purpose !== 'email-verification' || !payload?.userId || !payload?.email) {
      throw new BadRequestException('Token de verificação inválido.');
    }

    const { user, alreadyVerified } = await this.userService.confirmarEmailVerificado(
      payload.userId,
      payload.email,
    );

    return {
      verified: true,
      alreadyVerified,
      email: user.email,
      userId: user.id,
      message: alreadyVerified
        ? 'Este endereço de e-mail já foi confirmado anteriormente.'
        : 'E-mail confirmado e marcado como verificado com sucesso!',
    };
  }
  /**
   * Solicitação de Acesso
   * 
   * @param ip 
   * @param payload 
   * @param req 
   * @param res 
   */
  @Public()
  @Post('Acessar')
  @ApiOperation({ operationId: 'AcessarAuth' })
  @ApiResponse({
    type: AcessoPayload
  })
  async Acessar(
    @Ip() ip,
    @Body() payload: AcessoPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      if (payload?.chaveAcesso && payload?.password) {
        let chave = await this.credencialService.obterChaveAcesso(payload.chaveAcesso);
        if (chave?.valid) {
          let { password, /* fullName,  */ username, email, phone,
            ...authenticated_user } = await this.userService.verificarAssinaturaAutenticacao(
              chave.identifiedUser, payload.password, chave.id
            );
          if (!authenticated_user) {
            throw new UnauthorizedException('Acesso negado. Usuário não identificado ou senha incorreta.');
          }
          const permission_uuid = randomUUID();
          const refresh_token = await this.jwtService.signAsync(
            {
              userId: authenticated_user.id,
              chaveAcesso: chave.id,
              permission: permission_uuid,
              try: btoa(JSON.stringify({
                permission: permission_uuid,
                chaveAcesso: chave.id,
                userId: authenticated_user.id
              }, null, 2))
            },
            {
              expiresIn: '1d',
            },
          );
          const refreshTokenArg2 = await this.userService.updateRefreshToken(authenticated_user.id, permission_uuid);
          chave.valid = true;
          chave.alive = true;
          if (payload?.publicKey) {
            this.credencialService.registrarChavePublica(chave, payload.publicKey, payload.publicKeyAlgorithm);
          }
          // chave.refreshToken = refreshTokenArg2;
          await this.credencialService.atualizar(chave);
          const { /* photo, */ ...user_payload } = authenticated_user;
          res.json({
            user: authenticated_user,
            chaveAcesso: chave.id,
            bearer: await this.jwtService.signAsync({
              id: user_payload.id,
              roles: user_payload.roles,
              permission: permission_uuid,
              chaveAcesso: chave.id,
              tenants: user_payload.tenants,
            }),
            refreshToken: refresh_token
          } as AcessoPayload);
        }
      } else if (payload?.chaveAcesso) {
        let chave = await this.credencialService.obterChaveAcesso(payload.chaveAcesso);
        const identified_user = await this.userService.existsUserByIdentification(payload.identificacao, chave.id);
        if (identified_user) {
          // A chave é vinculada ao usuário identificado sem revogar outros dispositivos
          chave.identifiedUser = identified_user.id;
          chave.valid = true;
          chave.alive = true;
          chave = await this.credencialService.atualizar(chave);
          res.json(new AcessoPayload({ ...chave, id: undefined }, identified_user.passwordMode));
        } else {
          throw new Error('Falha ao localizar chave de acesso.');
        }
      } else {
        const chaveAcesso = (await this.credencialService.solicitarCredencial({
          ip: ip,
          headers: req.headers as any
        }));
        res.json({
          chaveAcesso: chaveAcesso.id,
        });
      }
    } catch (error) {
      if (!!error && typeof (error as any).status === 'number')
        res.status(((error as any)?.status) || 500).json({
          status: 500,
          message: 'Falha'
        })
      else console.trace(error);
    }
  }
  @Post('Dispositivos')
  @ApiOperation({ operationId: 'GetDispositivosAuth' })
  async getDispositivos(@Req() req: any) {
    try {
      const userId = req.user?.id;
      const currentChaveAcesso = req.chaveAcesso;
      if (!userId) {
        throw new UnauthorizedException('Usuário não autenticado.');
      }
      const lista = await this.credencialService.obterDispositivosVinculados(userId);
      return lista.map(item => ({
        ...item,
        isCurrent: item.id === currentChaveAcesso,
        isOnline: BusService.isChaveAcessoOnline(item.id) || item.id === currentChaveAcesso,
      }));
    } catch (error) {
      console.trace(error);
      return [];
    }
  }
  @Post('DesconectarDispositivo')
  @ApiOperation({ operationId: 'DesconectarDispositivoAuth' })
  async desconectarDispositivo(@Req() req: any, @Body() body: { chaveAcesso: string }) {
    try {
      const userId = req.user?.id;
      const currentChaveAcesso = req.chaveAcesso;
      const targetChaveAcesso = body?.chaveAcesso;
      if (!userId || !targetChaveAcesso) {
        throw new UnauthorizedException('Requisição inválida.');
      }
      const success = await this.credencialService.desconectarDispositivo(userId, targetChaveAcesso);
      if (success) {
        BusService.disconnectChaveAcesso(targetChaveAcesso);
      }
      return {
        success,
        isCurrent: targetChaveAcesso === currentChaveAcesso,
      };
    } catch (error) {
      console.trace(error);
      return { success: false, error: (error as any)?.message };
    }
  }

  @Post('DesconectarOutrosDispositivos')
  @ApiOperation({ operationId: 'DesconectarOutrosDispositivosAuth' })
  async desconectarOutrosDispositivos(@Req() req: any) {
    try {
      const userId = req.user?.id;
      const currentChaveAcesso = req.chaveAcesso;
      if (!userId || !currentChaveAcesso) {
        throw new UnauthorizedException('Usuário não autenticado.');
      }
      const result = await this.credencialService.desconectarOutrosDispositivos(userId, currentChaveAcesso);
      if (result.success && result.disconnectedIds?.length) {
        result.disconnectedIds.forEach(id => BusService.disconnectChaveAcesso(id));
      }
      return { success: result.success };
    } catch (error) {
      console.trace(error);
      return { success: false, error: (error as any)?.message };
    }
  }
  @Post('Logout')
  @ApiOperation({ operationId: 'LogoutAuth' })
  async logout(@Req() req: any) {
    try {
      const userId = req?.user?.id;
      const chaveAcesso = req?.chaveAcesso;
      if (userId && chaveAcesso) {
        const disconnected = await this.credencialService.desconectarDispositivo(userId, chaveAcesso);
        if (disconnected) {
          BusService.disconnectChaveAcesso(chaveAcesso);
        }
        return { success: disconnected };
      }
      if (userId) {
        return await this.userService.logout({ id: userId } as any);
      }
      return { success: false };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.trace(error);
      throw new InternalServerErrorException('Falha ao encerrar sessão.');
    }
  }
  @Public()
  @Post('Refresh')
  @ApiResponse({ type: AuthorizationOutput })
  @ApiOperation({ operationId: 'RefreshAuth' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() payload: RefreshPayloadInputDto,
    @Ip() ip,
  ) {
    try {
      const result = await this.authService.refreshToken(
        null,
        payload?.refreshToken,
        req as any,
        ip,
        payload?.chaveAcesso,
        payload?.publicKey,
        payload?.publicKeyAlgorithm,
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.trace(error);
      throw new UnauthorizedException('Falha ao renovar autorização.');
    }
  }
}
