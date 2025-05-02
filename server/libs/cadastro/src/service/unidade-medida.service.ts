import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { UnidadeMedida } from "../model/unidade-medida.entity";
export class UnidadeMedidaService extends DaoFullAuditedServiceBase<UnidadeMedida> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(UnidadeMedida)
        repository: Repository<UnidadeMedida>
    ) {
        super(snap, repository);
    }
}