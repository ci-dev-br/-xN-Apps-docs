import { Body, Controller, Post } from "@nestjs/common";
import { PessoaService } from "../service/pessoa.service";
import { ControllerDaoBase } from "@ci/core";
import { Pessoa } from "../model/pessoa.entity";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoPessoa } from "../dto/sync-payload-dao-pessoa";
import { ObterListaPessoa } from "../dto/obter-list-pessoa";
/**
 * Pessoa Controller
 */
@ApiTags('Pessoa')
@Controller('Pessoa')
export class PessoaController extends ControllerDaoBase<PessoaService, Pessoa> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoPessoa
    })
    @ApiOperation({
        operationId: 'SyncPessoa'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoPessoa,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoPessoa
    })
    @ApiOperation({
        operationId: 'GetListPessoa'
    })
    override async GetList(
        @Body() input: ObterListaPessoa,
    ) {
        return super.GetList(input);
    }
}