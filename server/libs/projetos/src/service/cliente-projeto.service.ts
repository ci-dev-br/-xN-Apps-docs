import { Repository } from "typeorm";
import { ClienteProjeto } from "../models/cliente-projeto.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class ClienteProjetoService extends DaoFullAuditedServiceBase<ClienteProjeto> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(ClienteProjeto)
        repository: Repository<ClienteProjeto>
    ) {
        super(snap, repository);
    }
}