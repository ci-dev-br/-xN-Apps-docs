import { Injectable } from "@nestjs/common";
import { Organizacao } from "../model/organizacao.entity";
import { ILike, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "src/auth/auth.module";

@Injectable()
export class OrganizacaoService {
    constructor(
        @InjectRepository(Organizacao)
        private readonly repo: Repository<Organizacao>,
        private readonly auth: AuthService,
    ) { }

    async syncronizar(organizacao: Organizacao) {
        if (organizacao.internalId) {
            const current = await this.repo.findOneBy({ internalId: organizacao.internalId });

            if ('organizatioName' in organizacao) current.organizatioName = organizacao.organizatioName;
            if ('logo' in organizacao) current.logo = organizacao.logo;
            if ('tenant' in organizacao) current.tenant = organizacao.tenant;
            if ('cadastroPessoa' in organizacao) current.cadastroPessoa = organizacao.cadastroPessoa;

            return this.repo.save(current);
        } else {
            const nova_organizacao = this.repo.create(organizacao);
            this.repo.save(nova_organizacao);
        }
    }
    async get(query: string) {

    }
    async current(userId: string) {
        return null;// this.repo.
    }
    async Find(query: string) {
        return await this.repo.findAndCount({
            relations: ['cadastroPessoa', 'logo', 'tenant'],
            where: [
                {
                    organizatioName: ILike('%' + query + '%'),
                },
                {
                    cadastroPessoa: {
                        nomeFantasia: ILike('%' + query + '%'),
                    }
                },
                {
                    cadastroPessoa: {
                        nome: ILike('%' + query + '%'),
                    }
                },
                {
                    cadastroPessoa: {
                        documentos: { numeroDocumento: ILike('%' + query + '%') }
                    }
                },
            ]
        })
    }
}