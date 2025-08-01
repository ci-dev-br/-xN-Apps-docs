import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Agendamento } from "../models/agendamento";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class AgendamentoService extends DaoServiceBase<Agendamento> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Agendamento)
        repository: Repository<Agendamento>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Agendamento> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}