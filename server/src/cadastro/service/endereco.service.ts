import { Injectable } from "@nestjs/common";
import { DaoServiceBase } from "src/core/dao";
import { Endereco } from "../model/endereco.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
@Injectable()
export class EnderecoService extends DaoServiceBase<Endereco> {
    constructor(
        @InjectRepository(Endereco)
        repository: Repository<Endereco>
    ) {
        super(repository);
    }
}