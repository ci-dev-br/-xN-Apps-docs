import { Repository } from "typeorm";
import { Transacao } from "../model/transacao.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class TransacaoService extends DaoFullAuditedServiceBase<Transacao> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Transacao)
        repository: Repository<Transacao>
    ) {
        super(snap, repository);
    }
}