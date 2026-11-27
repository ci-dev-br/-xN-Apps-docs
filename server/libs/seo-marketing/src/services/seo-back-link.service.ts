import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SeoBackLink } from "../models/seo-back-link.entity";

@Injectable()
export class SeoBackLinkService extends DaoFullAuditedServiceBase<SeoBackLink> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoBackLink)
        repository: Repository<SeoBackLink>
    ) {
        super(snap, repository);
    }
}
