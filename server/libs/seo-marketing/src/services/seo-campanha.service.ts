import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SeoCampanha } from "../models/seo-campanha.entity";

@Injectable()
export class SeoCampanhaService extends DaoFullAuditedServiceBase<SeoCampanha> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoCampanha)
        repository: Repository<SeoCampanha>
    ) {
        super(snap, repository);
    }
}
