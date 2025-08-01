import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SiteOption } from "../models/site-option.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class SiteOptionService extends DaoFullAuditedServiceBase<SiteOption> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SiteOption)
        repository: Repository<SiteOption>
    ) {
        super(snap, repository);
    }
}