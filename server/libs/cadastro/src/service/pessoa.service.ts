import { Repository } from "typeorm";
import { Pessoa } from "../model/pessoa.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class PessoaService extends DaoFullAuditedServiceBase<Pessoa> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Pessoa)
        repository: Repository<Pessoa>
    ) {
        super(snap, repository);
    }
}