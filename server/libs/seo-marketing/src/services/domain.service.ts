import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoServiceBase, SnapshotService } from "@ci/manager";
import { Domain } from "../models/domain.entity";
@Injectable()
export class DomainService extends DaoServiceBase<Domain> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Domain)
        repo: Repository<Domain>
    ) {
        super(snap, repo);
    }
}  