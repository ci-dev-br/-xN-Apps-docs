import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { readdirSync } from "fs";
import { ReadDirectoryInput } from "./dto/read-directory-input.dto";

@ApiTags('FileExplorer')
@Controller('FileExplorer')
export class FileExplorerController {
    constructor() { }

    @Post('ReadDirectory')
    async readDirectory(
        @Body() input: ReadDirectoryInput,

    ) {
        return readdirSync(input.path, { withFileTypes: true });
    }
}