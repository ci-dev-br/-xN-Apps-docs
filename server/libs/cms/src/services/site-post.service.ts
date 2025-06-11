import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SitePost } from "../models/site-post.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class SitePostService extends DaoFullAuditedServiceBase<SitePost> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SitePost)
        repository: Repository<SitePost>
    ) {
        super(snap, repository);
    }
}