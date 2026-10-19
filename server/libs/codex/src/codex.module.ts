import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CodexService } from "./service/codex.service";
import { CodexController } from "./controller/codex.controller";
import { CoreModule } from "@ci/core/core.module";
import { CodigoFonte } from "./models/codigo-fonte.entity";
import { File } from "./models/file.entity";
import { TerminalService } from './service/terminal.service';
import { Action } from "./models/action.entity";

export const CodeXEntities = [
    CodigoFonte,
    File,
    Action,
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
        TerminalService,
    ],
    exports: [
        CodexService,
        TerminalService,
    ]
})
export class CodexModule { }
