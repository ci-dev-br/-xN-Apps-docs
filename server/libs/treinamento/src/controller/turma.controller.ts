import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@ci/auth/decorators/role.decorator";
import { ControllerDaoBase, GetByInternalIdInputDto } from "@ci/manager";
import { Turma } from "../models/turma.entity";
import { TurmaService } from "../service/turma.service";
import { ObterListaTurma, SyncPayloadDaoTurma } from "../dto/treinamento.dto";

@Role('USER')
@ApiTags('Turma')
@Controller('Turma')
export class TurmaController extends ControllerDaoBase<TurmaService, Turma> {
    constructor(turmaService: TurmaService) {
        super(turmaService);
    }

    @Post('Sync')
    @ApiResponse({ type: Turma })
    @ApiOperation({ operationId: 'SyncTurma' })
    override async Sync(@Body() body: SyncPayloadDaoTurma, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Turma })
    @ApiOperation({ operationId: 'GetByInternalIdTurma' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Turma, isArray: true })
    @ApiOperation({ operationId: 'GetListTurma' })
    override async GetList(@Body() input: ObterListaTurma, @Req() req?: any) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Turma })
    @ApiOperation({ operationId: 'DeleteTurma' })
    override async Delete(@Body() body: Turma, @Req() req?: any) {
        return await super.Delete(body, req);
    }
}
