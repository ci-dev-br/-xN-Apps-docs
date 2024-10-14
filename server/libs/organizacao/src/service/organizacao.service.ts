import { Injectable } from "@nestjs/common";
import { Organizacao } from "../model/organizacao.entity";
import { Equal, ILike, In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "@ci/auth/auth.module";

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
            if ('cadastroPessoa' in organizacao) current.responsavel = organizacao.responsavel;

            return this.repo.save(current);
        } else {
            const nova_organizacao = this.repo.create(organizacao);
            this.repo.save(nova_organizacao);
        }
    }
    async get(query: string) {

    }
    async Find(query: string) {
        return await this.repo.findAndCount({
            relations: ['cadastroPessoa', 'logo', 'tenant'],
            where: [
                {
                    organizatioName: ILike('%' + query + '%'),
                },
                {
                    responsavel: {
                        nomeFantasia: ILike('%' + query + '%'),
                    }
                },
                {
                    responsavel: {
                        nome: ILike('%' + query + '%'),
                    }
                },
                {
                    responsavel: {
                        documentos: { numeroDocumento: ILike('%' + query + '%') }
                    }
                },
            ]
        })
    }
}