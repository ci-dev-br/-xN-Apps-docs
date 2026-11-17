import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Block } from "../models/block.entity";

@Injectable()
export class BlockService extends DaoFullAuditedServiceBase<Block> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Block)
        private readonly blockRepo: Repository<Block>,
    ) {
        super(snap, blockRepo);
    }
}
