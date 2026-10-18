import { Repository } from "typeorm";
import { TipoDocumentoIdentificacao } from "../model/tipo-documento-identificacao.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";

export class TipoDocumentoIdentificacaoService extends DaoFullAuditedServiceBase<TipoDocumentoIdentificacao> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(TipoDocumentoIdentificacao)
        repository: Repository<TipoDocumentoIdentificacao>
    ) {
        super(snap, repository);
    }
}
