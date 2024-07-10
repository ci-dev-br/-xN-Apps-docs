import { Body, Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiResponseProperty, ApiTags } from "@nestjs/swagger";
import { readdirSync } from "fs";
import { ReadDirectoryInput } from "./dto/read-directory-input.dto";
import { ReadDirectoryOutput } from "./dto/read-directory-output.dto";
import { Role } from "@ci/auth/decorators/role.decorator";

@ApiTags('FileExplorer')
@Controller('FileExplorer')
export class FileExplorerController {
    constructor() { }
    @ApiResponse({ type: ReadDirectoryOutput, isArray: true })
    @Role('MASTER')
    @Post('ReadDirectory')
    async readDirectory(
        @Body() input: ReadDirectoryInput,

    ) {
        return readdirSync(input.path, { withFileTypes: true }).map(v => {
            return {
                ...v,
                isFile: v.isFile(),
                isDirectory: v.isDirectory(),
                isSocket: v.isSocket(),
                isFIFO: v.isFIFO(),
                isSymbolicLink: v.isSymbolicLink(),
            }
        }).filter(f => f.name.indexOf('.') !== 0 && f.name.indexOf('$') !== 0);
    }
}