import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SeoKeyWord } from "../models/seo-key-word.entity";

@Injectable()
export class SeoKeyWordService extends DaoFullAuditedServiceBase<SeoKeyWord> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoKeyWord)
        repository: Repository<SeoKeyWord>
    ) {
        super(snap, repository);
    }
}
