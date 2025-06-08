import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Links } from "../models/links.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class LinksService extends DaoServiceBase<Links> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Links)
        repository: Repository<Links>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Links> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}