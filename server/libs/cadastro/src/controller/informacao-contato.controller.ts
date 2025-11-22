import { Body, Controller, Post } from "@nestjs/common";
import { InformacaoContatoService } from "../service/informacao-contato.service";
import { ControllerDaoBase } from "@ci/core";
import { InformacaoContato } from "../model/informacao-contato.entity";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoInformacaoContato } from "../dto/sync-payload-dao-informacao-contato";
import { ObterListaInformacaoContato } from "../dto/obter-lista-informacao-contato";
/**
 * InformacaoContato Controller
 * 
 * 
 */
@ApiTags('InformacaoContato')
@Controller('InformacaoContato')
export class InformacaoContatoController extends ControllerDaoBase<InformacaoContatoService, InformacaoContato> {
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
    ) {
        return await super.Sync(body)
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
    ) {
        return super.GetList(input);
    }
}