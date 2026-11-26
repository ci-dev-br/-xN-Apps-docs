import { Body, Controller, Get, Ip, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AcessoPayload, AuthorizationOutput, RefreshPayloadInputDto, RegistrarInputDto } from './dto/dto';
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
import * as argon2 from 'argon2';
import { BadRequestException } from '@nestjs/common';
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
        fullName: user.fullName,
        surname: user.surname || user.fullName || user.username || user.email,
        photo: {
          /*   originalFile: user.photo.originalFile,
            format: user.photo.format */
        },
        roles: (user.roles && user.roles.length > 0) ? user.roles : ['USER'],
      };
    } catch (error) {
      console.trace(error);
      return {
        status: 500,
        message: 'Falha',
      }
    }
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
  async logout(@Req() req) {
    try {
      return await this.userService.logout(null)
    } catch (error) {
      console.trace(error);
      return {
        status: typeof error === 'object' && typeof (error as any).status === 'number' ?
          (error as { status: number }).status || 500 : 509,
        message: 'Falha'
      } as any
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
      console.info(req.cookies['refresh_token']);
      res.json((await this.authService.refreshToken(
        null, payload?.refreshToken, req as any, ip, payload?.chaveAcesso
      )));
    } catch (error) {
      console.trace(error);
      return {
        status: typeof error === 'object' && typeof (error as any).status === 'number' ?
          (error as { status: number }).status || 500 : 509,
        message: 'Falha'
      } as any
    }
  }
}
