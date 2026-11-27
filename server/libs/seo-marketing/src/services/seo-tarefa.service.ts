import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { SeoTarefa } from "../models/seo-tarefa.entity";

@Injectable()
export class SeoTarefaService extends DaoFullAuditedServiceBase<SeoTarefa> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(SeoTarefa)
        repository: Repository<SeoTarefa>
    ) {
        super(snap, repository);
    }
}
