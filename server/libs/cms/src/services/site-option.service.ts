import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SiteOption } from "../models/site-option.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class SiteOptionService extends DaoServiceBase<SiteOption> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SiteOption)
        repository: Repository<SiteOption>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<SiteOption> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}