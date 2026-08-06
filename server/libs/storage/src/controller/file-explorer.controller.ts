import { Body, Controller, Optional, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { ReadDirectoryInput } from "./dto/read-directory-input.dto";
import { ReadDirectoryOutput } from "./dto/read-directory-output.dto";
import { Role } from "@ci/auth/decorators/role.decorator";
import { FileDto } from "./dto/file-dto";
import { FilePermissionService } from "../service/file-permission.service";
import { FileExplorerService } from "../models/file-explorer.service";
@Role('SYSADMIN')
@ApiTags('FileExplorer')
@Controller('FileExplorer')
export class FileExplorerController {
    constructor(
        @Optional() private readonly filePermissions: FilePermissionService,
        @Optional() private readonly fileExplorer: FileExplorerService,
    ) { }
    @ApiResponse({ type: ReadDirectoryOutput, isArray: true })
    @ApiOperation({ operationId: 'ReadDirectory' })
    @Post('ReadDirectory')
    async readDirectory(
        @Body() input: ReadDirectoryInput,
        @Req() request: Request
    ) {
        return await this.fileExplorer.readDirectory(input, request);
    }
    @Post('File')
    @ApiOperation({ operationId: 'ReadFile' })
    @ApiResponse({ type: FileDto })
    async readFile(
        @Body() input: FileDto,
        @Req() request: Request,
    ) {
        return await this.fileExplorer
            .readFile(input, request);
    }
}