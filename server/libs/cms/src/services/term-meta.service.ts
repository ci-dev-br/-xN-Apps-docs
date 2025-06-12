import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { TermMeta } from "../models/term-meta.entity";

export class TermMetaService extends DaoFullAuditedServiceBase<TermMeta> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(TermMeta)
        repository: Repository<TermMeta>
    ) {
        super(snap, repository);
    }
}