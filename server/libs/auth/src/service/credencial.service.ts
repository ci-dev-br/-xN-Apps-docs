import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { ChaveAcesso } from "@ci/core";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class CredencialService {
    constructor(
        @InjectRepository(ChaveAcesso)
        private readonly chaveAcessoRepo: Repository<ChaveAcesso>,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }
    async solicitarCredencial(
        partials?: {
            identificacao_inicial?: string,
            ip?: string,
            ips?: string[]
        },
    ) {
        let nova_chave = this.chaveAcessoRepo.create({
            identifiedUser: partials?.identificacao_inicial,
            createdFromIp: partials?.ip,
            valid: true,
        });
        nova_chave = await this.chaveAcessoRepo.save(nova_chave);
        return nova_chave;
    }
    async obterChaveAcesso(
        assinatura?: string,
    ) {
        //  console.log(assinatura)
        return await this.chaveAcessoRepo.createQueryBuilder('chave_acesso')
            .where(`encode(sha512(chave_acesso.id::varchar::bytea), 'hex') = :id`)
            .setParameter('id', assinatura)
            .getOne();
    }
    async atualizar(
        chave: ChaveAcesso
    ) {
        return await this.chaveAcessoRepo.save(chave);
    }
    async eliminarChaves(user_id: string) {
        const chaves_ativas = await this.chaveAcessoRepo.find({
            where: {
                identifiedUser: user_id, valid: true
            }
        });
        if (chaves_ativas)
            chaves_ativas.forEach(chave => {
                chave.valid = false;
            });
        await this.chaveAcessoRepo.save(chaves_ativas);
    }
}