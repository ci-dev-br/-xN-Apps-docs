import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CodexService } from "./service/codex.service";
import { CodexController } from "./controller/codex.controller";
import { CodexFilesController } from "./controller/codex-files.controller";
import { CoreModule } from "@ci/core/core.module";
import { CodigoFonte } from "./models/codigo-fonte.entity";
import { File } from "./models/file.entity";
import { TerminalService } from './service/terminal.service';
import { Action } from "./models/action.entity";
import { Block } from "./models/block.entity";
import { BlockService } from "./service/block.service";
import { BlockController } from "./controller/block.controller";

export const CodeXEntities = [
    CodigoFonte,
    File,
    Action,
    Block,
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
        CodexFilesController,
        BlockController,
    ],
    providers: [
        CodexService,
        TerminalService,
        BlockService,
    ],
    exports: [
        CodexService,
        TerminalService,
        BlockService,
    ]
})
export class CodexModule { }
