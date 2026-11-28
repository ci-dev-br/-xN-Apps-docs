import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@ci/auth/decorators/role.decorator";
import { ControllerDaoBase, GetByInternalIdInputDto } from "@ci/manager";
import { Curso } from "../models/curso.entity";
import { CursoService } from "../service/curso.service";
import {
    GetCatalogoCursoInputDto,
    GetCatalogoCursoOutputDto,
    ObterListaCurso,
    SyncPayloadDaoCurso,
} from "../dto/treinamento.dto";

@Role('USER')
@ApiTags('Curso')
@Controller('Curso')
export class CursoController extends ControllerDaoBase<CursoService, Curso> {
    constructor(private readonly cursoService: CursoService) {
        super(cursoService);
    }

    @Post('Sync')
    @ApiResponse({ type: Curso })
    @ApiOperation({ operationId: 'SyncCurso' })
    override async Sync(@Body() body: SyncPayloadDaoCurso, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Curso })
    @ApiOperation({ operationId: 'GetByInternalIdCurso' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto) {
        return await this.cursoService.carregarCursoCompleto(input.internalId!);
    }

    @Post('GetList')
    @ApiResponse({ type: Curso, isArray: true })
    @ApiOperation({ operationId: 'GetListCurso' })
    override async GetList(@Body() input: ObterListaCurso, @Req() req?: any) {
        return await super.GetList({
            ...input,
            relations: { instrutor: true, aulas: true, turmas: true },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Curso })
    @ApiOperation({ operationId: 'DeleteCurso' })
    override async Delete(@Body() body: Curso, @Req() req?: any) {
        return await super.Delete(body, req);
    }

    @Post('GetCatalogo')
    @ApiResponse({ type: GetCatalogoCursoOutputDto })
    @ApiOperation({ operationId: 'GetCatalogoCurso' })
    async GetCatalogo(@Body() input: GetCatalogoCursoInputDto, @Req() req?: any) {
        return await this.cursoService.getCatalogo(input || {}, req);
    }
}
