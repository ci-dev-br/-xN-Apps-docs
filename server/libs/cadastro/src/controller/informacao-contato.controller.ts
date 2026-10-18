import { Body, Controller, Post, Req } from "@nestjs/common";
import { InformacaoContatoService } from "../service/informacao-contato.service";
import { ControllerDaoBase } from "@ci/core";
import { InformacaoContato } from "../model/informacao-contato.entity";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoInformacaoContato } from "../dto/sync-payload-dao-informacao-contato";
import { ObterListaInformacaoContato } from "../dto/obter-lista-informacao-contato";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
/**
 * InformacaoContato Controller
 * 
 * 
 */
@ApiTags('InformacaoContato')
@Controller('InformacaoContato')
export class InformacaoContatoController extends ControllerDaoBase<InformacaoContatoService, InformacaoContato> {
    constructor(
        service: InformacaoContatoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDaoInformacaoContato
    })
    @ApiOperation({
        operationId: 'SyncInformacaoContato'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoInformacaoContato,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req)
    }
    @Post('GetByInternalId')
    @ApiResponse({
        type: InformacaoContato,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdInformacaoContato',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoInformacaoContato
    })
    @ApiOperation({
        operationId: 'GetListInformacaoContato'
    })
    override async GetList(
        @Body() input: ObterListaInformacaoContato,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
    @Post('Delete')
    @ApiResponse({
        type: InformacaoContato,
    })
    @ApiOperation({
        operationId: 'DeleteInformacaoContato',
    })
    override async Delete(
        @Body() body: InformacaoContato,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}