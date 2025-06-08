import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { CommentMeta } from "../models/comment-meta.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class CommentMetaService extends DaoServiceBase<CommentMeta> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(CommentMeta)
        repository: Repository<CommentMeta>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<CommentMeta> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}