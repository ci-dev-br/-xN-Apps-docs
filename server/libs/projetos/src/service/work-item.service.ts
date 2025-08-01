import { Repository } from "typeorm";
import { WorkItem } from "../models/work-item.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
export class WorkItemService extends DaoFullAuditedServiceBase<WorkItem> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(WorkItem)
        repository: Repository<WorkItem>
    ) {
        super(snap, repository);
    }
}