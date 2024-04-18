import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { UserCredentialService } from "./user-credential.service";
import { CredencialService } from "./credencial.service";
@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly userCredentialService: UserCredentialService,
        private jwtService: JwtService,
        private readonly credencial: CredencialService,
    ) {
        console.log('[Authenticantion service created]')
    }
    async refreshToken(
        userId?: string,
        refreshToken?: string,
        req?: Request,
        ip?: string,
    ) {
        const r: { try?: string } = await this.jwtService.verifyAsync(refreshToken);
        let old_authorization: {
            id: string,
            roles: string[],
            exp: number,
            iat: number,
        };
        let permission = null;
        if ('try' in r && r.try && typeof r.try === 'string') {
            permission = JSON.parse(atob(r.try)).permission;
            old_authorization = (await this.jwtService.decode(req.headers['authorization'].replace('Bearer', '').trim())) as any;
            userId = old_authorization.id;
        }
        const user = await this.userService.findById(userId);
        this.userCredentialService.credenciar(user.id);
        if (user) {
            const chaveAcesso = (await this.credencial.solicitarCredencial({
                ip: ip,
                identificacao_inicial: old_authorization.id
            }));
            return {
                authorization: await this.jwtService.signAsync({
                    id: user?.id,
                    roles: user?.roles,
                    permission: permission,
                    chaveAcesso: chaveAcesso.id
                })
            }
        } else {
            throw new UnauthorizedException('Acesso Nagado');
        }
    }
}