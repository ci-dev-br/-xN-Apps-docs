import { Controller, Injectable } from "@nestjs/common";
import { CodexService } from "../service/codex.service";

@Controller('Codex')
export class CodexController {
    constructor(
        private readonly service: CodexService,
    ) { }
}