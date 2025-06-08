import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Website } from "../models/website.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class WebsiteService extends DaoServiceBase<Website> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Website)
        repository: Repository<Website>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Website> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}