import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { ClienteCrm } from "../models/cliente";
import { Injectable } from "@nestjs/common";
/**
 * Serviço de ClienteCrm de CRM
 */
@Injectable()
export class ClienteCrmService extends DaoFullAuditedServiceBase<ClienteCrm> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(ClienteCrm)
        repository: Repository<ClienteCrm>
    ) {
        super(snap, repository);
    }
}