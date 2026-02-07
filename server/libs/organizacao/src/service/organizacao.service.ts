
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Organizacao } from "../organizacao.module";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
export class OrganizacaoService extends DaoFullAuditedServiceBase<Organizacao> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Organizacao)
        repository: Repository<Organizacao>
    ) {
        super(snap, repository);
    }
}