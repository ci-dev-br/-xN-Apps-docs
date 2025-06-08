import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SitePost } from "../models/site-post.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class SitePostService extends DaoServiceBase<SitePost> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SitePost)
        repository: Repository<SitePost>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<SitePost> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}