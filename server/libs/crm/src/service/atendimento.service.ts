import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Atendimento } from "../models/atendimento";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class AtendimentoService extends DaoServiceBase<Atendimento> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Atendimento)
        repository: Repository<Atendimento>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Atendimento> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}