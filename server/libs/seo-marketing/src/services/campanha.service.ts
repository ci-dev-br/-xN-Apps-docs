import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
import { SeoCampanha } from "../models/seo-campanha.entity";
@Injectable()
export class CampanhaService extends DaoFullAuditedServiceBase<SeoCampanha> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoCampanha)
        repo: Repository<SeoCampanha>
    ) {
        super(snap, repo);
    }
}  