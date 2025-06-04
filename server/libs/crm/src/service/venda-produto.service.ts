import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { VendaProduto } from "../models/venda-produto";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class VendaProdutoService extends DaoServiceBase<VendaProduto> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(VendaProduto)
        repository: Repository<VendaProduto>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<VendaProduto> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}