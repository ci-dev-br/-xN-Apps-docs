import { Repository } from "typeorm";
import { Pessoa } from "../model/pessoa.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoServiceBase } from "src/core/dao";

export class PessoaService extends DaoServiceBase<Pessoa> {
    constructor(
        @InjectRepository(Pessoa)
        private readonly repository: Repository<Pessoa>
    ) {
        super(repository);
    }
}