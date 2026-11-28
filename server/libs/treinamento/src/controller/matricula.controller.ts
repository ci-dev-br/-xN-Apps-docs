import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@ci/auth/decorators/role.decorator";
import { ControllerDaoBase, GetByInternalIdInputDto } from "@ci/manager";
import { Matricula } from "../models/matricula.entity";
import { MatriculaService } from "../service/matricula.service";
import {
    MatricularCursoInputDto,
    ObterListaMatricula,
    RegistrarProgressoInputDto,
    SyncPayloadDaoMatricula,
} from "../dto/treinamento.dto";

@Role('USER')
@ApiTags('Matricula')
@Controller('Matricula')
export class MatriculaController extends ControllerDaoBase<MatriculaService, Matricula> {
    constructor(private readonly matriculaService: MatriculaService) {
        super(matriculaService);
    }

    @Post('Sync')
    @ApiResponse({ type: Matricula })
    @ApiOperation({ operationId: 'SyncMatricula' })
    override async Sync(@Body() body: SyncPayloadDaoMatricula, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Matricula })
    @ApiOperation({ operationId: 'GetByInternalIdMatricula' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Matricula, isArray: true })
    @ApiOperation({ operationId: 'GetListMatricula' })
    override async GetList(@Body() input: ObterListaMatricula, @Req() req?: any) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Matricula })
    @ApiOperation({ operationId: 'DeleteMatricula' })
    override async Delete(@Body() body: Matricula, @Req() req?: any) {
        return await super.Delete(body, req);
    }

    @Post('Matricular')
    @ApiResponse({ type: Matricula })
    @ApiOperation({ operationId: 'MatricularMatricula' })
    async Matricular(@Body() input: MatricularCursoInputDto, @Req() req?: any) {
        return await this.matriculaService.matricular(input, req);
    }

    @Post('RegistrarProgresso')
    @ApiResponse({ type: Matricula })
    @ApiOperation({ operationId: 'RegistrarProgressoMatricula' })
    async RegistrarProgresso(@Body() input: RegistrarProgressoInputDto, @Req() req?: any) {
        return await this.matriculaService.registrarProgresso(input, req);
    }
}
