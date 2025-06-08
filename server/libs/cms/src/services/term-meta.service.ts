import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { TermMeta } from "../models/term-meta.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class TermMetaService extends DaoServiceBase<TermMeta> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(TermMeta)
        repository: Repository<TermMeta>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<TermMeta> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}