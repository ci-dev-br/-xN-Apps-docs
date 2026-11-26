import { Body, Controller, Optional, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReadDirectoryInput } from "./dto/read-directory-input.dto";
import { ReadDirectoryOutput } from "./dto/read-directory-output.dto";
import { Role } from "@ci/auth/decorators/role.decorator";
import { FileDto } from "./dto/file-dto";
import { FilePermissionService } from "../service/file-permission.service";
import { FileExplorerService } from "../models/file-explorer.service";
import {
    AuthorizeFilePermissionInputDto,
    AuthorizeFilePermissionOutputDto,
    FilePermissionItemDto,
    GetPermissionRequestInputDto,
    MyFilePermissionsOutputDto,
    RequestFilePermissionInputDto,
    RequestFilePermissionOutputDto,
} from "./dto/file-permission.dto";

@ApiTags('FileExplorer')
@Controller('FileExplorer')
export class FileExplorerController {
    constructor(
        @Optional() private readonly filePermissions: FilePermissionService,
        @Optional() private readonly fileExplorer: FileExplorerService,
    ) { }

    @Role('SYSADMIN')
    @ApiResponse({ type: ReadDirectoryOutput, isArray: true })
    @ApiOperation({ operationId: 'ReadDirectory' })
    @Post('ReadDirectory')
    async readDirectory(
        @Body() input: ReadDirectoryInput,
        @Req() request: Request
    ) {
        return await this.fileExplorer.readDirectory(input, request);
    }

    @Role('SYSADMIN')
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

    @Post('RequestPermission')
    @ApiOperation({ operationId: 'RequestFilePermission' })
    @ApiResponse({ type: RequestFilePermissionOutputDto })
    async requestPermission(
        @Body() input: RequestFilePermissionInputDto,
        @Req() request: Request,
    ): Promise<RequestFilePermissionOutputDto> {
        return await this.fileExplorer.requestPermission(input, request);
    }

    @Role('SYSADMIN')
    @Post('GetPermissionRequest')
    @ApiOperation({ operationId: 'GetFilePermissionRequest' })
    @ApiResponse({ type: FilePermissionItemDto })
    async getPermissionRequest(
        @Body() input: GetPermissionRequestInputDto,
    ) {
        return await this.fileExplorer.getPermissionRequest(input?.token);
    }

    @Role('SYSADMIN')
    @Post('AuthorizePermission')
    @ApiOperation({ operationId: 'AuthorizeFilePermission' })
    @ApiResponse({ type: AuthorizeFilePermissionOutputDto })
    async authorizePermission(
        @Body() input: AuthorizeFilePermissionInputDto,
        @Req() request: Request,
    ): Promise<AuthorizeFilePermissionOutputDto> {
        return await this.fileExplorer.authorizePermission(input, request);
    }

    @Post('MyPermissions')
    @ApiOperation({ operationId: 'MyFilePermissions' })
    @ApiResponse({ type: MyFilePermissionsOutputDto })
    async myPermissions(
        @Req() request: Request,
    ): Promise<MyFilePermissionsOutputDto> {
        return await this.fileExplorer.myPermissions(request);
    }
}
