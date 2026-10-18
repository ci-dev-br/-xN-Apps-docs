import { Repository } from "typeorm";
import { DocumentoIdentificacao } from "../model/documento-identificacao.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";

export class DocumentoIdentificacaoService extends DaoFullAuditedServiceBase<DocumentoIdentificacao> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(DocumentoIdentificacao)
        repository: Repository<DocumentoIdentificacao>
    ) {
        super(snap, repository);
    }
}
