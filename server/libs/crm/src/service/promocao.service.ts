import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Promocao } from "../models/promocao";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class PromocaoService extends DaoServiceBase<Promocao> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Promocao)
        repository: Repository<Promocao>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Promocao> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}