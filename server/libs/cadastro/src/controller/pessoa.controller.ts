import { Body, Controller, Post, Req } from "@nestjs/common";
import { PessoaService } from "../service/pessoa.service";
import { ControllerDaoBase } from "@ci/core";
import { Pessoa } from "../model/pessoa.entity";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoPessoa } from "../dto/sync-payload-dao-pessoa";
import { ObterListaPessoa } from "../dto/obter-list-pessoa";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
import { Role } from "@ci/auth/decorators/role.decorator";
/**
 * Pessoa Controller
 */
@Role('USER')
@ApiTags('Pessoa')
@Controller('Pessoa')
export class PessoaController extends ControllerDaoBase<PessoaService, Pessoa> {
    constructor(
        service: PessoaService
    ) {
        super(service);
    }
    @Role('USER')
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
    @Role('USER')
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
    @Role('USER')
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
    @Role('USER')
    @Post('Delete')
    @ApiResponse({
        type: Pessoa
    })
    @ApiOperation({
        operationId: 'DeletePessoa'
    })
    override async Delete(
        @Body() body: Pessoa,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}