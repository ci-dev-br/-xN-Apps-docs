import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SnapshotService } from "@ci/core";
import { ClienteCrm } from "../models/cliente";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class ClienteCrmService extends DaoServiceBase<ClienteCrm> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(ClienteCrm)
        repository: Repository<ClienteCrm>,
        dataSource?: DataSource,
    ) {
        super(snap, repository, dataSource);
    }
    override async getById(id: string, request?: any): Promise<ClienteCrm> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}