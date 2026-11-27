import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SiteMedia } from "../models/site-media.entity";

export class SiteMediaService extends DaoFullAuditedServiceBase<SiteMedia> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SiteMedia)
        repository: Repository<SiteMedia>
    ) {
        super(snap, repository);
    }
}
