import { Repository } from "typeorm";
import { LancamentoFinanceiro } from "../model/lancamento.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class LancamentoService extends DaoFullAuditedServiceBase<LancamentoFinanceiro> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(LancamentoFinanceiro)
        repository: Repository<LancamentoFinanceiro>
    ) {
        super(snap, repository);
    }
}