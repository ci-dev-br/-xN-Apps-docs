import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@ci/auth/decorators/role.decorator';
import { CodexService } from '../service/codex.service';
import {
    LocateSourceFileInputDto,
    LocateSourceFileOutputDto,
} from './dto/locate-file.dto';

@ApiTags('CodexFiles')
@Role('DEVELOPER', 'SYSADMIN')
@Controller('Codex/Files')
export class CodexFilesController {
    constructor(private readonly codexService: CodexService) {}

    @Get('Locate')
    @ApiOperation({
        summary: 'Localiza arquivos de código-fonte no workspace pelo nome (requer role DEVELOPER ou SYSADMIN)',
        operationId: 'LocateCodexSourceFilesGet',
    })
    @ApiQuery({ name: 'name', type: String, required: true })
    @ApiQuery({ name: 'extensions', type: String, required: false, description: 'Lista separada por vírgula (ex: .ts,.html)' })
    @ApiQuery({ name: 'directory', type: String, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiResponse({ status: 200, type: LocateSourceFileOutputDto })
    async locateByQuery(
        @Query('name') name: string,
        @Query('extensions') extensions?: string,
        @Query('directory') directory?: string,
        @Query('limit') limit?: string,
    ): Promise<LocateSourceFileOutputDto> {
        const parsedExtensions = extensions
            ? extensions.split(',').map(s => s.trim()).filter(Boolean)
            : undefined;
        return this.codexService.locateFilesByName({
            name,
            extensions: parsedExtensions,
            directory,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Post('Locate')
    @ApiOperation({
        summary: 'Localiza arquivos de código-fonte no workspace pelo nome (requer role DEVELOPER ou SYSADMIN)',
        operationId: 'LocateCodexSourceFiles',
    })
    @ApiResponse({ status: 200, type: LocateSourceFileOutputDto })
    async locateByBody(
        @Body() input: LocateSourceFileInputDto,
    ): Promise<LocateSourceFileOutputDto> {
        return this.codexService.locateFilesByName(input || { name: '' });
    }
}
