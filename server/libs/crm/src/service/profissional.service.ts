import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Profissional } from "../models/profissional";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class ProfissionalService extends DaoServiceBase<Profissional> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Profissional)
        repository: Repository<Profissional>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Profissional> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}