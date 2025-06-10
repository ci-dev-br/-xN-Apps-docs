import { Repository } from "typeorm";
import { InformacaoContato } from "../model/informacao-contato.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class InformacaoContatoService extends DaoFullAuditedServiceBase<InformacaoContato> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(InformacaoContato)
        repository: Repository<InformacaoContato>,
    ) {
        super(snap, repository);
    }
}