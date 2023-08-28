import { Body, Controller, Get, Ip, Post, Request } from '@nestjs/common';
import { AcessoPayload, RegistrarInputDto } from './dto/dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { User } from '../models/user.entity';
import { Public } from '../decorators/public.decorator';
import { CredencialService } from '../service/credencial.service';
import { IncomingMessage } from 'http';
import { ChaveAcesso } from '../models/chave-acesso.entity';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly credencialService: CredencialService
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
        let autenticated_user = await this.userService.verificarAssinaturaAutenticacao(
          chave.identifiedUser, payload.password, chave.id
        );
        chave.valid = false;
        chave.alive = true;
        await this.credencialService.atualizar(chave);
        return {
          user: {
            ...autenticated_user,
            password: undefined,
          },
        } as AcessoPayload;
      }
    } else if (payload?.chaveAcesso) {
      let chave = await this.credencialService.obterChaveAcesso(payload.chaveAcesso);
      const identified_user = await this.userService.existsUserByIdentification(payload.identificacao, chave.id);
      await this.credencialService.eliminarChaves(identified_user.id);
      chave.identifiedUser = identified_user.id;
      chave = await this.credencialService.atualizar(chave);
      return new AcessoPayload({ ...chave, id: undefined });
    } else {
      return {
        chaveAcesso: {
          ...(await this.credencialService.solicitarCredencial({
            ip: ip
          }))
        }.id
      };
    }
  }
}
