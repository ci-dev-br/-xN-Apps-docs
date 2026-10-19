import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ROLE_KEY } from './decorators/role.decorator';
import { CredencialService } from './service/credencial.service';
import { UserService } from './auth.module';
import { IncomingMessage } from 'http';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private credencial: CredencialService,
    private readonly userService: UserService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<any>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const by_pass = isPublic ? true : false;
    const role = this.reflector?.getAllAndOverride<string>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request: IncomingMessage = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (request.url.indexOf('Refresh') !== -1) { return true }
    if (!token) {
      if (!by_pass)
        throw new UnauthorizedException('Falha na autenticação. Token não fornecido.');
    } else {
      try {
        const payload: { id: string, roles: string[], permission: string, chaveAcesso: string } = await this.jwtService.verifyAsync(token, {
          secret: process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret,
        });
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        // console.log('ROLE', role)
        // console.log('PAYLOAD', payload)
        request['chaveAcesso'] = payload.chaveAcesso;
        if (!payload.chaveAcesso) {
          if (!by_pass) throw new UnauthorizedException('Chave de acesso ausente ou inválida.');
        }
        let chave_acesso_local = await this.credencial.obterChaveAcessoPorId(payload.chaveAcesso);
        if (!chave_acesso_local || !chave_acesso_local.alive || !chave_acesso_local.valid) {
          if (!by_pass) throw new UnauthorizedException('Acesso revogado, favor autenticar novamente.');
        }
        request['user'] = await this.userService.findByIdLight(payload.id);

        // Suporte a múltiplas contas conectadas simultaneamente: combina permissões e papéis
        const additionalTokensHeader = request.headers['x-additional-tokens'] as string | undefined;
        const combinedRoles = new Set<string>(Array.isArray(payload.roles) ? payload.roles : []);

        if (additionalTokensHeader) {
          const additionalTokens = additionalTokensHeader.split(',').map(t => t.trim()).filter(Boolean);
          for (const addToken of additionalTokens) {
            try {
              const addPayload = await this.jwtService.verifyAsync(addToken, {
                secret: process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret,
              });
              if (addPayload?.roles && Array.isArray(addPayload.roles)) {
                for (const r of addPayload.roles) {
                  combinedRoles.add(r);
                }
              }
            } catch {
              // Token adicional expirado ou inválido não bloqueia a requisição principal
            }
          }
        }

        const allRoles = Array.from(combinedRoles);
        request['combinedRoles'] = allRoles;
        if (request['user']) {
          request['user']['roles'] = allRoles;
        }

        if (!!role) {
          if (!combinedRoles.has(role)) {
            if (!by_pass) throw new UnauthorizedException('Acesso negado. Não corresponde ao nível de acesso necessário.');
          }
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Falha na autenticação. Token inválido ou expirado.');
      }
    }
    return true;
  }
  private extractTokenFromHeader(request: IncomingMessage): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
