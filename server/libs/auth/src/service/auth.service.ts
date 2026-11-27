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
        chaveAcessoParam?: string,
        publicKey?: string,
        publicKeyAlgorithm?: string,
    ) {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token não fornecido.');
        }

        let r: any;
        try {
            r = await this.jwtService.verifyAsync(refreshToken);
        } catch (error) {
            console.trace(error);
            throw new UnauthorizedException('Refresh token expirado ou inválido.');
        }

        let permission: string = r?.permission;
        let chaveAcessoId: string = chaveAcessoParam || r?.chaveAcesso;
        let tokenUserId: string = r?.userId || r?.id;

        if (!permission && r?.try && typeof r.try === 'string') {
            try {
                const parsedTry = JSON.parse(atob(r.try));
                permission = parsedTry?.permission || permission;
                chaveAcessoId = parsedTry?.chaveAcesso || chaveAcessoId;
                tokenUserId = parsedTry?.userId || tokenUserId;
            } catch {}
        }

        // Tenta também resgatar chaveAcesso do header Authorization expirado (Bearer token)
        const rawAuthHeader = (req as any)?.headers?.['authorization']?.replace(/^Bearer\s+/i, '').trim();
        if (rawAuthHeader) {
            try {
                const old_authorization: any = this.jwtService.decode(rawAuthHeader);
                if (!chaveAcessoId && old_authorization?.chaveAcesso) {
                    chaveAcessoId = old_authorization.chaveAcesso;
                }
                if (!tokenUserId && old_authorization?.id) {
                    tokenUserId = old_authorization.id;
                }
            } catch {}
        }

        if (!chaveAcessoId && (req as any)?.body?.chaveAcesso) {
            chaveAcessoId = (req as any).body.chaveAcesso;
        }

        if (!chaveAcessoId) {
            throw new UnauthorizedException('Chave de acesso não identificada para este refresh token.');
        }

        // 💡 O refresh token DEVE usar a chave de acesso para verificar se ainda é válido:
        const chave_acesso = await this.credencial.obterChaveAcessoPorId(chaveAcessoId);
        if (!chave_acesso) {
            throw new UnauthorizedException('Chave de acesso inexistente.');
        }

        if (chave_acesso.valid === false || chave_acesso.alive === false) {
            throw new UnauthorizedException('A chave de acesso deste dispositivo foi revogada ou expirou.');
        }

        userId = tokenUserId || chave_acesso.identifiedUser || userId;
        if (chave_acesso.identifiedUser && userId && chave_acesso.identifiedUser !== userId) {
            throw new UnauthorizedException('A chave de acesso não pertence a este usuário.');
        }

        userId = chave_acesso.identifiedUser || userId;
        const user = await this.userService.findByIdLight(userId);
        if (!user) {
            throw new UnauthorizedException('Usuário não localizado.');
        }

        // Permite registrar chave pública apenas se a credencial ainda não possuía uma (migração de sessão)
        if (publicKey && !chave_acesso.publicKey) {
            this.credencial.registrarChavePublica(chave_acesso, publicKey, publicKeyAlgorithm);
        }

        // Mantém a mesma chave de acesso ativa e rotaciona o refresh token mantendo a segmentação da sessão
        chave_acesso.alive = true;
        await this.credencial.atualizar(chave_acesso);

        const nextRefreshToken = await this.jwtService.signAsync(
            {
                userId: user.id,
                chaveAcesso: chave_acesso.id,
                permission: permission,
                try: btoa(JSON.stringify({
                    permission: permission,
                    chaveAcesso: chave_acesso.id,
                    userId: user.id
                }, null, 2))
            },
            {
                expiresIn: '1d',
            },
        );

        return {
            authorization: await this.jwtService.signAsync({
                id: user.id,
                roles: user.roles,
                permission: permission,
                chaveAcesso: chave_acesso.id,
            }),
            refreshToken: nextRefreshToken,
            chaveAcesso: chave_acesso.id,
        };
    }
}