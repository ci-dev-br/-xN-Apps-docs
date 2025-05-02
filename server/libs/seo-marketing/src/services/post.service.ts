import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
import { Post } from "../models/post.entity";
@Injectable()
export class PostService extends DaoFullAuditedServiceBase<Post> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Post)
        repo: Repository<Post>
    ) {
        super(snap, repo);
    }
}  