import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Pais } from "../model/pais.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class PaisService extends DaoServiceBase<Pais> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Pais)
        repository: Repository<Pais>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Pais> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}