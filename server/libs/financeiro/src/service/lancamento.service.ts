import { Repository } from "typeorm";
import { Lancamento } from "../model/lancamento.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class LancamentoService extends DaoFullAuditedServiceBase<Lancamento> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Lancamento)
        repository: Repository<Lancamento>
    ) {
        super(snap, repository);
    }
}