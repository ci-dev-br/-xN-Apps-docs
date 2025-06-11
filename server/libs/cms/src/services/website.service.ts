import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Website } from "../models/website.entity";

export class WebsiteService extends DaoFullAuditedServiceBase<Website> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Website)
        repository: Repository<Website>
    ) {
        super(snap, repository);
    }
}