import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { CampanhaMarketing } from "../models/campanha-marketing";

/**
 * Serviço de CampanhaMarketing de CRM
 */
@Injectable()
export class CampanhaMarketingService extends DaoFullAuditedServiceBase<CampanhaMarketing> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(CampanhaMarketing)
        repository: Repository<CampanhaMarketing>
    ) {
        super(snap, repository);
    }
}
