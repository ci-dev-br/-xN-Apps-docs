import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SeoDomain } from "../models/seo-domain.entity";

@Injectable()
export class SeoDomainService extends DaoFullAuditedServiceBase<SeoDomain> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoDomain)
        repository: Repository<SeoDomain>
    ) {
        super(snap, repository);
    }
}
