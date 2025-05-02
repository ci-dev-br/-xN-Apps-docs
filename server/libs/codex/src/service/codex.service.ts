import { Injectable } from "@nestjs/common";
import { CodeBlock } from "../models/code-block.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
@Injectable()
export class CodexService extends DaoFullAuditedServiceBase<CodeBlock> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(CodeBlock)
        private readonly codeBlockRepo: Repository<CodeBlock>,
    ) { super(snap, codeBlockRepo); }
}