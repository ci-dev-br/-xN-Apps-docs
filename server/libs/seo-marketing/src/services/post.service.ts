import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
import { SeoPost } from "../models/seo-post.entity";
@Injectable()
export class PostService extends DaoFullAuditedServiceBase<SeoPost> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoPost)
        repo: Repository<SeoPost>
    ) {
        super(snap, repo);
    }
}  