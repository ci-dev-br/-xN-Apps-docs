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
}