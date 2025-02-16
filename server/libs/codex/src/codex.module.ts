import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agent } from "./models/agent";
import { CodexService } from "./service/codex.service";
import { CodexController } from "./controller/codex.controller";
import { CodeBlock } from "./models/code-block.entity";
import { CoreModule } from "@ci/core/core.module";
import { Terminoligia } from "./models/termo";
import { CodigoFonte } from "./models/codigo-fonte.entity";
import { Lexico } from "./models/lexico";
import { File } from "./models/file.entity";
export const CodeXEntities = [
    // Agent,
    // CodeBlock,
    // Termo,
    CodigoFonte,
    File,
    // Lexico,
];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature([
            ...CodeXEntities,
        ]),
    ],
    controllers: [
        // CodexController,
    ],
    providers: [
        // CodexService,
    ],
})
export class CodexModule { }
