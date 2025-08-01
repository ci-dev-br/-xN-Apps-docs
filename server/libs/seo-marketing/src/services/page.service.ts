import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Page } from "../seo-marketing.module";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
@Injectable()
export class PageService extends DaoFullAuditedServiceBase<Page> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Page)
        repo: Repository<Page>
    ) {
        super(snap, repo);
    }
}  