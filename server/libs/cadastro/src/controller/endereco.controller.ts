import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Endereco } from "../model/endereco.entity";
import { ControllerDaoBase } from "@ci/manager";
import { EnderecoService } from "../service/endereco.service";
import { SyncPayloadDaoEndereco } from "../dto/sync-payload-dao-endereco";
import { ObterListaEndereco } from "../dto/obter-lista-endereco";
@ApiTags('Endereco')
@Controller('Endereco')
export class EnderecoController extends ControllerDaoBase<EnderecoService, Endereco> {
    constructor(
        service: EnderecoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoEndereco,
    })
    @ApiOperation({
        operationId: 'SyncEndereco',
        description: 'Syncronize data with node api',
    })
    override async Sync(
        @Body() body: SyncPayloadDaoEndereco,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req)
    }
    @Post('Get')
    @ApiResponse({
        type:
            SyncPayloadDaoEndereco
    })
    @ApiOperation({
        operationId: 'GetListEndereco',
        description: 'Get list from Endereço Entities',
    })
    override async GetList(
        @Body() input: ObterListaEndereco,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
}