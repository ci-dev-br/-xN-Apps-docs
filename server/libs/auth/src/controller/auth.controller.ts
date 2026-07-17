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
            throw new UnauthorizedException();
          }
          chave.valid = true;
          chave.alive = false;
          await this.credencialService.atualizar(chave);
          const permission_uuid = randomUUID();
          const refresh_token = await this.jwtService.signAsync(
            {
              try: btoa(JSON.stringify({
                permission: permission_uuid
              }, null, 2))
            },
            {
              // TODO: obter chave para criptografia do jwt para o usuário,
              //secret: jwtConstants.secret,
              expiresIn: '90d',
            },
          );
          // authenticated_user.refreshToken = refresh_token;
          const refreshTokenArg2 = await this.userService.updateRefreshToken(authenticated_user.id, permission_uuid);
          chave = await this.credencialService.obterChaveAcesso(payload.chaveAcesso);
          chave.refreshToken = refreshTokenArg2;
          await this.credencialService.atualizar(chave);
          const { /* photo, */ ...user_payload } = authenticated_user;
          // Set the refresh token in an HttpOnly cookie
          // TODO: Ajustar a implemetação do refresh token para utilização de cookies HttpOnly, para maior segurança.
          /*  res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            path: '/',
            secure: true, // process.env.NODE_ENV === 'production', // true in production (HTTPS)
            sameSite: 'none', // or 'none' if backend and frontend are on different domains
            maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
          }); */
          res.json({
            user: authenticated_user,
            bearer: await this.jwtService.signAsync({
              id: user_payload.id,
              chaveAcesso: chave.id,
              tenants: user_payload.tenants,
            }),
            refreshToken: refresh_token
          } as AcessoPayload);
        }
      } else if (payload?.chaveAcesso) {
        let chave = await this.credencialService.obterChaveAcesso(payload.chaveAcesso);
        const identified_user = await this.userService.existsUserByIdentification(payload.identificacao, chave.id);
        // if(!identified_user) throw ('')
        // O que fazer quando o usuário não é identificado?
        if (identified_user) {
          await this.credencialService.eliminarChaves(identified_user.id);
          //const two_factory_autentication = await this.twoFactorAuthenticationService.requestTwoFactorAuthentication(identified_user);
          //if (!two_factory_autentication) {
          //  return {
          //    chaveAcesso: chave.id,
          //    stage: 'Authorization Code'
          //  }
          //}
          chave.identifiedUser = identified_user.id;
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
        null, req.cookies['refresh_token'], req as any, ip
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
