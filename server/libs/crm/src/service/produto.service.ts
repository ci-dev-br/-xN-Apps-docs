import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Produto } from "../models/produto";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class ProdutoService extends DaoServiceBase<Produto> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Produto)
        repository: Repository<Produto>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Produto> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}