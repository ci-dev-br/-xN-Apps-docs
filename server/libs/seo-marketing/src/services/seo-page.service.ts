import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SeoPage } from "../models/seo-page.entity";

@Injectable()
export class SeoPageService extends DaoFullAuditedServiceBase<SeoPage> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoPage)
        repository: Repository<SeoPage>
    ) {
        super(snap, repository);
    }
}
