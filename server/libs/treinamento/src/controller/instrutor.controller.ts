import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@ci/auth/decorators/role.decorator";
import { ControllerDaoBase, GetByInternalIdInputDto } from "@ci/manager";
import { Instrutor } from "../models/instrutor.entity";
import { InstrutorService } from "../service/instrutor.service";
import { ObterListaInstrutor, SyncPayloadDaoInstrutor } from "../dto/treinamento.dto";

@Role('USER')
@ApiTags('Instrutor')
@Controller('Instrutor')
export class InstrutorController extends ControllerDaoBase<InstrutorService, Instrutor> {
    constructor(private readonly instrutorService: InstrutorService) {
        super(instrutorService);
    }

    @Post('Sync')
    @ApiResponse({ type: Instrutor })
    @ApiOperation({ operationId: 'SyncInstrutor' })
    override async Sync(@Body() body: SyncPayloadDaoInstrutor, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Instrutor })
    @ApiOperation({ operationId: 'GetByInternalIdInstrutor' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Instrutor, isArray: true })
    @ApiOperation({ operationId: 'GetListInstrutor' })
    override async GetList(@Body() input: ObterListaInstrutor, @Req() req?: any) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Instrutor })
    @ApiOperation({ operationId: 'DeleteInstrutor' })
    override async Delete(@Body() body: Instrutor, @Req() req?: any) {
        return await super.Delete(body, req);
    }

    @Post('MeuPerfil')
    @ApiResponse({ type: Instrutor })
    @ApiOperation({ operationId: 'MeuPerfilInstrutor' })
    async MeuPerfil(@Req() req?: any) {
        return await this.instrutorService.obterOuCriarMeuPerfil(req);
    }
}
