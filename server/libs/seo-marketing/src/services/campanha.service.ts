import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoServiceBase, SnapshotService } from "@ci/manager";
import { Campanha } from "../models/campanha.entity";
@Injectable()
export class CampanhaService extends DaoServiceBase<Campanha> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Campanha)
        repo: Repository<Campanha>
    ) {
        super(snap, repo);
    }
}  