import { Equal, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SitePage } from "../models/site-page.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class SitePageService extends DaoFullAuditedServiceBase<SitePage> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SitePage)
        repository: Repository<SitePage>
    ) {
        super(snap, repository);
    }


    async getPage(domain: string,) {
        return this._repo.findOne({
            where: {
                website: {
                    domain: Equal(domain),
                }
            }
        })
    }
}