import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SitePage } from "../models/site-page.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class SitePageService extends DaoServiceBase<SitePage> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SitePage)
        repository: Repository<SitePage>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<SitePage> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}