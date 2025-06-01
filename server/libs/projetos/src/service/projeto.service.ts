import { Repository } from "typeorm";
import { Projeto } from "../models/projeto.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class ProjetoService extends DaoFullAuditedServiceBase<Projeto> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Projeto)
        repository: Repository<Projeto>
    ) {
        super(snap, repository);
    }
}