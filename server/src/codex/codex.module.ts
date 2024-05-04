import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agent } from "./models/agent";
import { CodexService } from "./service/codex.service";
import { CodexController } from "./controller/codex.controller";
import { CodeBlock } from "./models/code-block.entity";
import { CoreModule } from "src/core/core.module";
export const CodeXEntities = [
    Agent,
    CodeBlock,
];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature([
            ...CodeXEntities,
        ]),
    ],
    controllers: [
        CodexController,
    ],
    providers: [
        CodexService,
    ],
})
export class CodexModule { }
