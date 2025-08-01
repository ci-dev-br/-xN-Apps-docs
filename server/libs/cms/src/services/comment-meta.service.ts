import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { CommentMeta } from "../models/comment-meta.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class CommentMetaService extends DaoFullAuditedServiceBase<CommentMeta> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(CommentMeta)
        repository: Repository<CommentMeta>
    ) {
        super(snap, repository);
    }
}