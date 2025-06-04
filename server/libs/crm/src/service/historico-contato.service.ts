import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { HistoricoContato } from "../models/historico-contato";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class HistoricoContatoService extends DaoServiceBase<HistoricoContato> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(HistoricoContato)
        repository: Repository<HistoricoContato>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<HistoricoContato> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}