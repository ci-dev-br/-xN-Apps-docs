import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { AtividadeCrm } from "../models/atividade-crm";

/**
 * Serviço de AtividadeCrm de CRM
 */
@Injectable()
export class AtividadeCrmService extends DaoFullAuditedServiceBase<AtividadeCrm> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(AtividadeCrm)
        repository: Repository<AtividadeCrm>
    ) {
        super(snap, repository);
    }

    override async sincronizar(data: AtividadeCrm, request?: any): Promise<AtividadeCrm> {
        if (data && !data.internalId) {
            const payload: AtividadeCrm = { ...data };
            delete payload.internalId;
            return await super.sincronizar(payload, request);
        }
        return await super.sincronizar(data, request);
    }
}
