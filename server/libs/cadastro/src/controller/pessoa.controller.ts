import { Body, Controller, Post, Req } from "@nestjs/common";
import { PessoaService } from "../service/pessoa.service";
import { ControllerDaoBase } from "@ci/core";
import { Pessoa } from "../model/pessoa.entity";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoPessoa } from "../dto/sync-payload-dao-pessoa";
import { ObterListaPessoa } from "../dto/obter-list-pessoa";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
/**
 * Pessoa Controller
 */
@ApiTags('Pessoa')
@Controller('Pessoa')
export class PessoaController extends ControllerDaoBase<PessoaService, Pessoa> {
    constructor(
        service: PessoaService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoPessoa
    })
    @ApiOperation({
        operationId: 'SyncPessoa'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoPessoa,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req)
    }
    @Post('GetByInternalId')
    @ApiResponse({
        type: Pessoa,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdPessoa',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req,
    ) {
        return await super.GetByInternalId(input, req);
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
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
}