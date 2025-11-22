import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Endereco } from "../model/endereco.entity";
import { ControllerDaoBase } from "@ci/manager";
import { EnderecoService } from "../service/endereco.service";
import { SyncPayloadDaoEndereco } from "../dto/sync-payload-dao-endereco";
import { ObterListaEndereco } from "../dto/ObterListaEndereco";
@ApiTags('Endereco')
@Controller('Endereco')
export class EnderecoController extends ControllerDaoBase<EnderecoService, Endereco> {
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
    ) {
        return await super.Sync(body)
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
    ) {
        return super.GetList(input);
    }
}