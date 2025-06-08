import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Term } from "../models/term.entity";
import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";

export class TermService extends DaoServiceBase<Term> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Term)
        repository: Repository<Term>
    ) {
        super(snap, repository);
    }
    override async getById(id: string, request?: any): Promise<Term> {
        return await this._repo.findOne({
            where: {
                internalId: id
            }
        })
    }
}