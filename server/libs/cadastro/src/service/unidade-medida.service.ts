import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { UnidadeMedida } from "../model/unidade-medida.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class UnidadeMedidaService extends DaoServiceBase<UnidadeMedida> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(UnidadeMedida)
        repository: Repository<UnidadeMedida>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<UnidadeMedida> {
        return await this._repo.findOne({
            where: {
                internationalCode: id
            }
        })
    }
}