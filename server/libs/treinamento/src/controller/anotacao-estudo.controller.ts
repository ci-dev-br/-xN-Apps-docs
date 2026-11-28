import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@ci/auth/decorators/role.decorator";
import { ControllerDaoBase, GetByInternalIdInputDto } from "@ci/manager";
import { AnotacaoEstudo } from "../models/anotacao-estudo.entity";
import { AnotacaoEstudoService } from "../service/anotacao-estudo.service";
import { ObterListaAnotacaoEstudo, SyncPayloadDaoAnotacaoEstudo } from "../dto/treinamento.dto";

@Role('USER')
@ApiTags('AnotacaoEstudo')
@Controller('AnotacaoEstudo')
export class AnotacaoEstudoController extends ControllerDaoBase<AnotacaoEstudoService, AnotacaoEstudo> {
    constructor(anotacaoService: AnotacaoEstudoService) {
        super(anotacaoService);
    }

    @Post('Sync')
    @ApiResponse({ type: AnotacaoEstudo })
    @ApiOperation({ operationId: 'SyncAnotacaoEstudo' })
    override async Sync(@Body() body: SyncPayloadDaoAnotacaoEstudo, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: AnotacaoEstudo })
    @ApiOperation({ operationId: 'GetByInternalIdAnotacaoEstudo' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: AnotacaoEstudo, isArray: true })
    @ApiOperation({ operationId: 'GetListAnotacaoEstudo' })
    override async GetList(@Body() input: ObterListaAnotacaoEstudo, @Req() req?: any) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: AnotacaoEstudo })
    @ApiOperation({ operationId: 'DeleteAnotacaoEstudo' })
    override async Delete(@Body() body: AnotacaoEstudo, @Req() req?: any) {
        return await super.Delete(body, req);
    }
}
