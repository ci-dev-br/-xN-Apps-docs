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
import { BusService } from '@ci/core';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly credencialService: CredencialService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) { }
  @Public()
  @Post('Registrar')
  @ApiOperation({ operationId: 'RegistrarAuth' })
  @ApiResponse({
    type: User
  })
  async registrar(
    @Req() req: Request,
    @Body() input?: RegistrarInputDto,
  ) {
    /***
     * 
     * 1 . solicita e-mail / numero celular 
     * 2 . envia mensagem de confirmação com link para continuação do cadastro
     * 3 . permite o usuário criar uma senha para acesso rápido ou outra forma de autenticação
     * 
     */
    // console.info(req.headers);
    try {
      if ((!!input.email || !!input.phone) && !input.identificacao) {
        // TODO: solicitar verificação do e-mail de contato do usuário cadastrante (Cliente ou Desenvolvedor).        
      } else {
        throw new Error('Erro temporário, tente novamente mais tarde.');
      }
      /* const created_user = await this.userService.registrar({
         email: input.email,
         fullName: input.fullName,
         emailVerificado: false,
         surname: input.surname,
         password: await argon2.hash(input.password),
         username: input.identificacao,
         phone: input.phone,
         passwordMode: 'argon2',
       });
       return created_user; */
    } catch (error) {
      console.trace(error);
      return {
        status: 500,
        message: error,
      }
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
      return user;
    } catch (error) {
      console.trace(error);
      return {
        status: 500,
        message: 'Falha',
      }
    }
  }
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
              expiresIn: '90d',
            },
          );
          const refreshTokenArg2 = await this.userService.updateRefreshToken(authenticated_user.id, permission_uuid);
          chave.valid = true;
          chave.alive = true;
          chave.refreshToken = refreshTokenArg2;
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
      console.trace(error);
      res.status(error?.status || 500).json({
        status: 500,
        message: 'Falha'
      } as any);
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
        status: error.status || 500,
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
      const return_message = {
        status: error.status || 500,
        error,
        message: error?.message || 'Ocorreu um erro não identificado relaizar a operação de refresh do token de acesso'
      } as any;
      res.status(return_message.status).json(return_message);
    }
  }
}
