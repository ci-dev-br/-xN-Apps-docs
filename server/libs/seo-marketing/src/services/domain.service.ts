import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
import { SeoDomain } from "../models/seo-domain.entity";
@Injectable()
export class DomainService extends DaoFullAuditedServiceBase<SeoDomain> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoDomain)
        repo: Repository<SeoDomain>
    ) {
        super(snap, repo);
    }
}  