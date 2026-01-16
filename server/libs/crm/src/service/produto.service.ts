import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Produto } from "../models/produto";
import { Injectable } from "@nestjs/common";
/**
 * Serviço de Produto de CRM
 */
@Injectable()
export class ProdutoService extends DaoFullAuditedServiceBase<Produto> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Produto)
        repository: Repository<Produto>
    ) {
        super(snap, repository);
    }
}