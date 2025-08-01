import { Repository } from "typeorm";
import { BillingType } from "../model/billing-type.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class BillingTypeService extends DaoFullAuditedServiceBase<BillingType> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(BillingType)
        repository: Repository<BillingType>
    ) {
        super(snap, repository);
    }
}