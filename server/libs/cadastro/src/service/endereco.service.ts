import { Injectable } from "@nestjs/common";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Endereco } from "../model/endereco.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
@Injectable()
export class EnderecoService extends DaoFullAuditedServiceBase<Endereco> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Endereco)
        repository: Repository<Endereco>,
    ) {
        super(snap, repository);
    }
}