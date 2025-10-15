import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { UserCredentialService } from "./user-credential.service";
import { CredencialService } from "./credencial.service";
import { Credential } from "@ci/core";
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
        let confiance: any = 'r';
        const r: { try?: string } = await this.jwtService.verifyAsync(refreshToken);
        let old_authorization: {
            id: string,
            roles: string[],
            exp: number,
            iat: number,
            chaveAcesso?: string;
            confiance: string,
        };
        let permission = null;
        let chave_acesso: Credential = null;
        if ('try' in r && r.try && typeof r.try === 'string') {
            permission = JSON.parse(atob(r.try)).permission;
            old_authorization = (await this.jwtService.decode(req.headers['authorization']?.replace('Bearer', '').trim())) as any;
            userId = old_authorization?.id;
            // TODO: verificar validade da chave de acesso 
            try {
                const chave_acesso_token = old_authorization?.chaveAcesso;
                chave_acesso = await this.credencial.obterChaveAcessoPorId(chave_acesso_token);
                chave_acesso;
                if (chave_acesso) {
                    if (userId !== chave_acesso?.identifiedUser) {
                        userId = chave_acesso?.identifiedUser;
                        confiance += 'v';
                    } else {
                        confiance += 'o';
                    }
                    if (!chave_acesso?.refreshToken) {
                        confiance += 'e';
                        throw new UnauthorizedException('Não é possível atualizar sua credencial. Identifique-se novamente.');
                    }
                }
            } catch (error) {
                console.trace(error);
                confiance += 'e';
                throw new UnauthorizedException('Sem autenticidade.', error);
            }
        }
        const user = await this.userService.findById(userId);
        this.userCredentialService.credenciar(user.id);
        if (user) {
            const chaveAcesso = (await this.credencial.solicitarCredencial({
                ip: ip,
                identificacao_inicial: chave_acesso.identifiedUser,  //  old_authorization.id
                headers: req.headers
            }));
            chaveAcesso.alive = true;
            chaveAcesso.valid = false;
            await this.credencial.atualizar(chaveAcesso);
            return {
                authorization: await this.jwtService.signAsync({
                    id: user?.id,
                    roles: user?.roles,
                    permission: permission,
                    chaveAcesso: chaveAcesso.id,
                    confiance
                })
            }
        } else {
            throw new UnauthorizedException('Acesso Nagado.');
        }
    }
}