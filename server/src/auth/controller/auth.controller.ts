import { Body, Controller, Get, Ip, Post, Req, Request, UnauthorizedException } from '@nestjs/common';
import { AcessoPayload, RegistrarInputDto } from './dto/dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { User } from '../models/user.entity';
import { Public } from '../decorators/public.decorator';
import { CredencialService } from '../service/credencial.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { randomUUID } from 'crypto';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly credencialService: CredencialService,
    private readonly jwtService: JwtService,
  ) { }
  @Public()
  @Post('Registrar')
  @ApiOperation({ operationId: 'Registrar' })
  @ApiResponse({
    type: User
  })
  async registrar(
    @Request() req: Request,
    @Body() input?: RegistrarInputDto,
  ) {
    const created_user = await this.userService.registrar({
      email: input.email,
      password: input.password,
      username: input.identificacao,
      phone: input.phone
    });
    return created_user;
  }
  @Post('Profile')
  @ApiOperation({ operationId: 'Profile' })
  @ApiResponse({
    type: User
  })
  async profile(
    @Request() req: Request,
  ) {
    return (req as any).user
  }
  @Public()
  @Post('Acessar')
  @ApiOperation({ operationId: 'Acessar' })
  @ApiResponse({
    type: AcessoPayload
  })
  async Acessar(
    @Ip() ip,
    @Body() payload: AcessoPayload
  ) {
    if (payload?.chaveAcesso && payload?.password) {
      let chave = await this.credencialService.obterChaveAcesso(payload.chaveAcesso);
      if (chave?.valid) {
        let authenticated_user = await this.userService.verificarAssinaturaAutenticacao(
          chave.identifiedUser, payload.password, chave.id
        );
        if (!authenticated_user) {
          throw new UnauthorizedException();
        }
        chave.valid = false;
        chave.alive = true;
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
            // secret: jwtConstants.secret,
            expiresIn: '7d',
          },
        );
        await this.userService.updateRefreshToken(authenticated_user.id, permission_uuid);
        return {
          user: {
            ...authenticated_user,
            password: undefined,
          },
          bearer: await this.jwtService.signAsync({
            ...authenticated_user,
            password: undefined,
          }),
          refresh_token
        } as AcessoPayload;
      }
    } else if (payload?.chaveAcesso) {
      let chave = await this.credencialService.obterChaveAcesso(payload.chaveAcesso);
      const identified_user = await this.userService.existsUserByIdentification(payload.identificacao, chave.id);
      // if(!identified_user) throw ('')
      // O que fazer quando o usuário não é identificado?
      await this.credencialService.eliminarChaves(identified_user.id);
      chave.identifiedUser = identified_user.id;
      chave = await this.credencialService.atualizar(chave);
      return new AcessoPayload({ ...chave, id: undefined });
    } else {
      const chaveAcesso = (await this.credencialService.solicitarCredencial({
        ip: ip
      }));
      return {
        chaveAcesso: chaveAcesso.id,
      };
    }
  }
  @Post('Logout')
  @ApiOperation({ operationId: 'Logout' })
  async logout(@Req() req) {
    this.userService.logout(null)
  }
  @Post('Refresh')
  @ApiOperation({ operationId: 'Refresh' })
  async refresh(@Req() req) {

  }
}
