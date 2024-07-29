import { Injectable } from "@nestjs/common";
import { CodeBlock } from "../models/code-block.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoServiceBase, SnapshotService } from "@ci/core";

@Injectable()
export class CodeBlockService extends DaoServiceBase<CodeBlock> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(CodeBlock)
        private readonly codeBlockRepo: Repository<CodeBlock>,
    ) { super(snap, codeBlockRepo); }


    /**
     * Aciona a execução do Bloco em um determinado Contexto de Execução
     * @param block 
     */
    async executeBlock(block: CodeBlock, ) {

    }
}