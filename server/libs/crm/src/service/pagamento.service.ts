import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Pagamento } from "../models/pagamento";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class PagamentoService extends DaoServiceBase<Pagamento> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Pagamento)
        repository: Repository<Pagamento>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Pagamento> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}