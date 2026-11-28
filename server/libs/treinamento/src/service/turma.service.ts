import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Repository } from "typeorm";
import { Turma } from "../models/turma.entity";

@Injectable()
export class TurmaService extends DaoFullAuditedServiceBase<Turma> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Turma)
        repository: Repository<Turma>,
    ) {
        super(snap, repository);
    }

    override async sincronizar(data: Turma, request?: any): Promise<Turma> {
        if (data?.cursoId && !data?.curso) {
            data.curso = { internalId: data.cursoId } as any;
        }
        if (data?.curso?.internalId && !data?.cursoId) {
            data.cursoId = data.curso.internalId;
        }
        return await super.sincronizar(data, request);
    }
}
