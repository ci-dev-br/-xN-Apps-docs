import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Credential, CredentialAccess } from "@ci/core";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { createHash } from "crypto";
@Injectable()
export class CredencialService {
    constructor(
        @InjectRepository(CredentialAccess)
        private readonly credentialAccessRepository: Repository<CredentialAccess>,
        @InjectRepository(Credential)
        private readonly credentialRepository: Repository<Credential>,
        // private readonly userService: UserService,
        // private readonly jwtService: JwtService,
    ) { }
    async solicitarCredencial(
        partials?: {
            identificacao_inicial?: string,
            ip?: string,
            ips?: string[],
            headers?: Headers
        },
    ) {
        try {
            let credential = this.credentialRepository.create({
                identifiedUser: partials?.identificacao_inicial,
                createdFromIp: partials?.ip,
                valid: true,
            });
            credential = await this.credentialRepository.save(credential);
            try {
                let headers: any = !!partials?.headers ? JSON.parse(JSON.stringify(partials.headers)) : undefined;
                if (headers) {
                    Object.keys(headers).forEach(p => {
                        if (typeof headers[p] === 'string' && headers[p].length > 256) {
                            headers[p] = 'md5:' + createHash('md5').update(String(headers[p])).digest('hex');
                        }
                    })
                }
                await this.credentialAccessRepository.save(
                    this.credentialAccessRepository.create({
                        credential: credential,
                        header: headers,
                        cf_pseudo_ipv4: partials?.headers ? partials?.headers['cf-pseudo-ipv4'] : undefined,
                        cf_connecting_ip: partials?.headers ? partials?.headers['cf-connecting-ip'] : undefined,
                        x_forwarded_for: partials?.headers ? partials?.headers['x-forwarded-for'] : undefined,
                    }));
            } catch (error) {
                console.trace("Falha ao registrar headers durante credenciamento.");
                console.trace(error);
                console.trace(partials.headers);
            }
            return credential;
        } catch (error) { console.trace(error); }
    }
    async obterChaveAcesso(
        assinatura?: string,
    ) {
        try {
            //  console.log(assinatura)
            return await this.credentialRepository.createQueryBuilder('chave_acesso')
                .where(`encode(sha512(chave_acesso.id::varchar::bytea), 'hex') = :id`)
                .setParameter('id', assinatura)
                .getOne();
        } catch (error) { console.trace(error); }
    }
    /***
     * Obtém chave de acesso a partir de sua ID
     * 
     */
    async obterChaveAcessoPorId(
        chave_acesso_id?: string,
    ) {
        try {
            return await this.credentialRepository.createQueryBuilder('chave_acesso')
                .where(`chave_acesso.id = :id`)
                .setParameter('id', chave_acesso_id)
                .getOne();
        } catch (error) { console.trace(error); }
    }
    async atualizar(
        chave: Credential,
    ) {
        return await this.credentialRepository.save(chave);
    }
    /**
     * 
     * @param user_id 
     */
    async eliminarChaves(user_id: string) {
        try {
            const chaves_ativas = await this.credentialRepository.find({
                where: {
                    identifiedUser: user_id, valid: true
                }
            });
            if (chaves_ativas)
                chaves_ativas.forEach(chave => {
                    chave.valid = false;
                });
            await this.credentialRepository.save(chaves_ativas);
        } catch (error) {
            console.trace(error);
            throw new Error("Falha ao invalidar chaves de acesso.");
        }
    }

    /**
     * Extrai detalhes legíveis a partir do User-Agent
     */
    parseUserAgent(ua?: string): { browser: string; os: string; deviceType: 'desktop' | 'mobile' | 'tablet' } {
        if (!ua || typeof ua !== 'string') {
            return { browser: 'Navegador Web', os: 'Sistema Operacional', deviceType: 'desktop' };
        }

        let os = 'Desktop';
        let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

        if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
        else if (/windows/i.test(ua)) os = 'Windows';
        else if (/android/i.test(ua)) { os = 'Android'; deviceType = 'mobile'; }
        else if (/iphone/i.test(ua)) { os = 'iPhone (iOS)'; deviceType = 'mobile'; }
        else if (/ipad/i.test(ua)) { os = 'iPad (iPadOS)'; deviceType = 'tablet'; }
        else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
        else if (/linux/i.test(ua)) os = 'Linux';

        let browser = 'Navegador Web';
        if (/edg/i.test(ua)) browser = 'Microsoft Edge';
        else if (/opr|opera/i.test(ua)) browser = 'Opera';
        else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
        else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';

        return { browser, os, deviceType };
    }

    /**
     * Obtém todos os dispositivos vinculados (chaves de acesso válidas) do usuário
     */
    async obterDispositivosVinculados(userId: string) {
        try {
            const chaves = await this.credentialRepository.find({
                where: {
                    identifiedUser: userId,
                    valid: true,
                },
                order: {
                    createdAt: 'DESC',
                },
            });

            const dispositivos = await Promise.all(chaves.map(async (chave) => {
                const acesso = await this.credentialAccessRepository.findOne({
                    where: { credential: { id: chave.id } },
                    order: { createdAt: 'DESC' },
                });

                const rawHeaders = acesso?.header || {};
                const userAgent = rawHeaders['user-agent'] || rawHeaders['User-Agent'] || '';
                const { browser, os, deviceType } = this.parseUserAgent(userAgent);
                const ip = chave.createdFromIp || acesso?.cf_connecting_ip || acesso?.x_forwarded_for || acesso?.cf_pseudo_ipv4 || '127.0.0.1';

                return {
                    id: chave.id,
                    createdAt: chave.createdAt,
                    createdFromIp: ip,
                    browser,
                    os,
                    deviceType,
                    rawUserAgent: userAgent,
                    valid: chave.valid,
                    alive: chave.alive,
                };
            }));

            return dispositivos;
        } catch (error) {
            console.trace(error);
            return [];
        }
    }

    /**
     * Desconecta um dispositivo individual invalidando sua chave de acesso
     */
    async desconectarDispositivo(userId: string, chaveAcessoId: string) {
        try {
            const chave = await this.credentialRepository.findOne({
                where: {
                    id: chaveAcessoId,
                    identifiedUser: userId,
                }
            });
            if (chave) {
                chave.alive = false;
                chave.valid = false;
                chave.refreshToken = null;
                await this.credentialRepository.save(chave);
                return true;
            }
            return false;
        } catch (error) {
            console.trace(error);
            return false;
        }
    }

    /**
     * Desconecta todos os outros dispositivos exceto o atual
     */
    async desconectarOutrosDispositivos(userId: string, currentChaveAcessoId: string): Promise<{ success: boolean; disconnectedIds: string[] }> {
        try {
            const chaves = await this.credentialRepository.find({
                where: {
                    identifiedUser: userId,
                    valid: true,
                }
            });
            const modificados: Credential[] = [];
            const disconnectedIds: string[] = [];
            for (const chave of chaves) {
                if (chave.id !== currentChaveAcessoId) {
                    chave.alive = false;
                    chave.valid = false;
                    chave.refreshToken = null;
                    modificados.push(chave);
                    disconnectedIds.push(chave.id);
                }
            }
            if (modificados.length > 0) {
                await this.credentialRepository.save(modificados);
            }
            return { success: true, disconnectedIds };
        } catch (error) {
            console.trace(error);
            return { success: false, disconnectedIds: [] };
        }
    }
}