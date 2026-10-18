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
    ) { }
    async refreshToken(
        userId?: string,
        refreshToken?: string,
        req?: Request,
        ip?: string,
    ) {
        let confiance: string = 'r';
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
            const rawAuthHeader = req?.headers?.['authorization']?.replace('Bearer', '').trim();
            old_authorization = rawAuthHeader ? (this.jwtService.decode(rawAuthHeader) as any) : null;
            userId = old_authorization?.id || userId;
            // TODO: verificar validade da chave de acesso 
            try {
                const chave_acesso_token = old_authorization?.chaveAcesso;
                if (chave_acesso_token) {
                    chave_acesso = await this.credencial.obterChaveAcessoPorId(chave_acesso_token);
                }
                if (chave_acesso) {
                    if (userId !== chave_acesso?.identifiedUser) {
                        userId = chave_acesso?.identifiedUser;
                        confiance += 'v';
                    } else {
                        confiance += 'o';
                    }
                    if (chave_acesso?.valid === false) {
                        // confiance += 'x';
                        // throw new UnauthorizedException('A sua sessão expirou. Por favor, identifique-se novamente // para continuar.');
                    }
                    if (!chave_acesso?.refreshToken) {
                        confiance += 'e';
                        if (confiance.indexOf('o') === -1) {
                            throw new UnauthorizedException('Por favor, identifique-se novamente.');
                        }
                    }
                }
            } catch (error) {
                console.trace(error);
                confiance += 'e';
                throw new UnauthorizedException('Acesso negado [1].', error);
            }
        }
        const user = await this.userService.findByIdLight(userId);
        if (user) {
            await this.userCredentialService.credenciar(user.id);
            let chaveAcesso = chave_acesso;
            if (chaveAcesso) {
                if (!chaveAcesso.alive) {
                    chaveAcesso.alive = true; // Chave ativa permite autenticar na aplicação
                    await this.credencial.atualizar(chaveAcesso);
                }
            } else {
                chaveAcesso = await this.credencial.solicitarCredencial({
                    ip: ip,
                    identificacao_inicial: user.id,
                    headers: req?.headers
                });
                chaveAcesso.alive = true; // Chave ativa permite autenticar na aplicação
                chaveAcesso.valid = false; // Chave válida permite gerar nova chave
                await this.credencial.atualizar(chaveAcesso);
            }
            return {
                authorization: await this.jwtService.signAsync({
                    id: user?.id,
                    roles: user?.roles,
                    permission: permission,
                    chaveAcesso: chaveAcesso.id,
                    confiance
                })
            };
        } else {
            throw new UnauthorizedException('Acesso Nagado.');
        }
    }
}