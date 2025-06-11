import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Links } from "../models/links.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class LinksService extends DaoFullAuditedServiceBase<Links> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Links)
        repository: Repository<Links>
    ) {
        super(snap, repository);
    }
}