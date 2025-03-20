import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ROLE_KEY } from './decorators/role.decorator';
import { CredencialService } from './service/credencial.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private credencial: CredencialService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const role = this.reflector.getAllAndOverride<string>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: { id: string, roles: string[], permission: string, chaveAcesso: string } = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      console.log('ROLE', role)
      console.log('PAYLOAD', payload)
      request['user'] = { id: payload.id };
      request['chaveAcesso'] = payload.chaveAcesso;

      let chave_acesso_local = await this.credencial.obterChaveAcessoPorId(payload.chaveAcesso);
      if (!chave_acesso_local || (!chave_acesso_local.alive)) {
        throw new UnauthorizedException('Acesso revogado, favor autenticar novamente.');
      }

      if (!!role) {
        if (!payload || !payload.roles.includes(role)) throw new UnauthorizedException('Acesso negado. Não corresponde ao nível de acesso necessário.');
      }
    } catch (err) {
      throw new UnauthorizedException(err);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
