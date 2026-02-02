import { Body, Controller, Optional, Post, Req } from "@nestjs/common";
import { ApiResponse, ApiResponseProperty, ApiTags } from "@nestjs/swagger";
import { readdirSync, readFileSync } from "fs";
import { ReadDirectoryInput } from "./dto/read-directory-input.dto";
import { ReadDirectoryOutput } from "./dto/read-directory-output.dto";
import { Role } from "@ci/auth/decorators/role.decorator";
import { FileDto } from "./dto/file-dto";
import { ConsoleLogEntry } from "selenium-webdriver/bidi/logEntries";
import { FilePermissionService } from "../service/file-permission.service";
@Role('SYSADMIN')
@ApiTags('FileExplorer')
@Controller('FileExplorer')
export class FileExplorerController {
    constructor(
        @Optional() private readonly filePermissions: FilePermissionService,
    ) { }
    @ApiResponse({ type: ReadDirectoryOutput, isArray: true })
    @Post('ReadDirectory')
    async readDirectory(
        @Body() input: ReadDirectoryInput,
        @Req() req: any
    ) {
        if (!!this.filePermissions) {
            if (await this.filePermissions.grant(input.path, req)) {

            } else {
                return null;
            }
        }
        return readdirSync(input.path, {
            withFileTypes: true,
        }).map(v => {
            console.log(v);
            return {
                ...v,
                isCharacterDevice: v.isCharacterDevice(),
                isFile: v.isFile(),
                isDirectory: v.isDirectory(),
                isSocket: v.isSocket(),
                isFIFO: v.isFIFO(),
                isSymbolicLink: v.isSymbolicLink(),
            }
        }).filter(f => f.name.indexOf('.') !== 0 && f.name.indexOf('$') !== 0);
    }

    @Post('File')
    @ApiResponse({ type: FileDto, isArray: true })
    async readFile(
        @Body() input: FileDto,
    ) {
        return readFileSync(input.path, {
            encoding: input.encoding as any || 'utf-8'
        })
    }
}