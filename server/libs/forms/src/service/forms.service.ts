import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/manager";
import { Injectable } from "@nestjs/common";
import { Form } from "../model/form.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
@Injectable()
export class FormsService extends DaoFullAuditedServiceBase<Form> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Form) repo: Repository<Form>,
    ) {
        super(snap, repo);
    }
}