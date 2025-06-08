import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Comment } from "../models/comment.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class CommentService extends DaoServiceBase<Comment> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Comment)
        repository: Repository<Comment>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Comment> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}