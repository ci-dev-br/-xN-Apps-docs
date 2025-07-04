import { Repository } from "typeorm";
import { ContaFinanceira } from "../model/conta.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class ContaService extends DaoFullAuditedServiceBase<ContaFinanceira> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(ContaFinanceira)
        repository: Repository<ContaFinanceira>
    ) {
        super(snap, repository);
    }
}