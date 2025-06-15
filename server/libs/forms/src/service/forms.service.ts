import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
import { Injectable } from "@nestjs/common";
import { Forms } from "../model/form.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
@Injectable()
export class FormsService extends DaoFullAuditedServiceBase<Forms> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Forms) repo: Repository<Forms>,
    ) {
        super(snap, repo);
    }
}