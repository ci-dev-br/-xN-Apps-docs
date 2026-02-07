import { Body, Controller, Post, Req } from "@nestjs/common";
import { OrganizacaoService } from "../service/Organizacao.service";
import { ControllerDaoBase } from "@ci/core";
import { Organizacao } from "../model/Organizacao.entity";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoOrganizacao } from "../dto/sync-payload-dao-organizacao";
import { ObterListaOrganizacao } from "../dto/obter-list-organizacao";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
/**
 * Organizacao Controller 
 */
@ApiTags('Organizacao')
@Controller('Organizacao')
export class OrganizacaoController extends ControllerDaoBase<OrganizacaoService, Organizacao> {
    constructor(
        service: OrganizacaoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoOrganizacao
    })
    @ApiOperation({
        operationId: 'SyncOrganizacao'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoOrganizacao,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req)
    }
    @Post('GetByInternalId')
    @ApiResponse({
        type: Organizacao,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdOrganizacao',
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
            SyncPayloadDaoOrganizacao
    })
    @ApiOperation({
        operationId: 'GetListOrganizacao'
    })
    override async GetList(
        @Body() input: ObterListaOrganizacao,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
}