import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
import { Campanha } from "../models/campanha.entity";
@Injectable()
export class CampanhaService extends DaoFullAuditedServiceBase<Campanha> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Campanha)
        repo: Repository<Campanha>
    ) {
        super(snap, repo);
    }
}  