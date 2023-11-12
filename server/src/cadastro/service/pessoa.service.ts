import { Repository } from "typeorm";
import { Pessoa } from "../model/pessoa.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoServiceBase, SnapshotService } from "src/core/dao";

export class PessoaService extends DaoServiceBase<Pessoa> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Pessoa)
        repository: Repository<Pessoa>
    ) {
        super(snap, repository);
    }
}