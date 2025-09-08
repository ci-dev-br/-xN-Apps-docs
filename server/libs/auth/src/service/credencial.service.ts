import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Credential, CredentialAccess } from "@ci/core";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { IncomingMessage } from "http";
@Injectable()
export class CredencialService {
    constructor(
        @InjectRepository(CredentialAccess)
        private readonly credentialAccessRepository: Repository<CredentialAccess>,
        @InjectRepository(Credential)
        private readonly credentialRepository: Repository<Credential>,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }
    async solicitarCredencial(
        partials?: {
            identificacao_inicial?: string,
            ip?: string,
            ips?: string[],
            headers?: Headers
        },
    ) {
        let nova_chave = this.credentialRepository.create({
            identifiedUser: partials?.identificacao_inicial,
            createdFromIp: partials?.ip,
            valid: true,
        });
        let access_info = this.credentialAccessRepository.create({
            credential: nova_chave,
            header: partials?.headers ? partials?.headers : undefined
        });
        nova_chave = await this.credentialRepository.save(nova_chave);
        try {
            access_info = await this.credentialAccessRepository.save(access_info);
        } catch (error) {
            console.trace(error);
            console.trace(partials.headers);
        }
        return nova_chave;
    }
    async obterChaveAcesso(
        assinatura?: string,
    ) {
        //  console.log(assinatura)
        return await this.credentialRepository.createQueryBuilder('chave_acesso')
            .where(`encode(sha512(chave_acesso.id::varchar::bytea), 'hex') = :id`)
            .setParameter('id', assinatura)
            .getOne();
    }
    async obterChaveAcessoPorId(
        chave_acesso_id?: string,
    ) {
        return await this.credentialRepository.createQueryBuilder('chave_acesso')
            .where(`chave_acesso.id = :id`)
            .setParameter('id', chave_acesso_id)
            .getOne();
    }
    async atualizar(
        chave: Credential,
    ) {
        return await this.credentialRepository.save(chave);
    }
    async eliminarChaves(user_id: string) {
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
    }
}