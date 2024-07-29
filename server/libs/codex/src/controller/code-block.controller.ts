

import { Controller, Injectable } from "@nestjs/common";
import { CodexService } from "../service/codex.service";

@Controller('CodeBlock')
export class CodeBlockController {
    constructor(
        private readonly service: CodexService,
    ) { }
}