import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Servico } from "../models/servico";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class ServicoService extends DaoServiceBase<Servico> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Servico)
        repository: Repository<Servico>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Servico> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}