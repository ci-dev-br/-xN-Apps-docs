import { Injectable } from "@nestjs/common";
import { DaoServiceBase, SnapshotService } from "src/core/dao";
import { Endereco } from "../model/endereco.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
@Injectable()
export class EnderecoService extends DaoServiceBase<Endereco> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Endereco)
        repository: Repository<Endereco>
    ) {
        super(snap, repository);
    }
}