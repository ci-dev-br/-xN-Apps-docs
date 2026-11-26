import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ControllerDaoBase } from "@ci/core";
import { Organizacao } from "../model/organizacao.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SyncPayloadDaoOrganizacao } from "../dto/sync-payload-dao-organizacao";
import { ObterListaOrganizacao } from "../dto/obter-list-organizacao";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
import { OrganizacaoService } from "../service/organizacao.service";
import {
    AtribuirRolesMembroDto,
    AtualizarOrganizacaoDto,
    CompartilharOrganizacaoDto,
    CriarOrganizacaoDto,
    CriarOrganizacaoRoleDto,
} from "../dto/organizacao-workspace.dto";

export class OrganizacaoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    where?: any;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
}
/**
 * Organizacao Controller 
 */
@ApiTags('Organizacao')
@Controller('Organizacao')
export class OrganizacaoController extends ControllerDaoBase<OrganizacaoService, Organizacao> {
    constructor(
        private readonly orgService: OrganizacaoService
    ) {
        super(orgService);
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
            Organizacao,
        isArray: true
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

    @Get('My')
    @ApiOperation({ operationId: 'MyOrganizacoes' })
    async minhasOrganizacoes(@Req() req: any) {
        return await this.orgService.listarMinhasOrganizacoes(req);
    }

    @Get('Users')
    @ApiOperation({ operationId: 'SearchOrganizacaoUsers' })
    async buscarUsuarios(@Query('search') search: string, @Req() req: any) {
        return await this.orgService.buscarUsuarios(search, req);
    }

    @Post('Create')
    @ApiOperation({ operationId: 'CreateOrganizacao' })
    async criarOrganizacao(@Body() body: CriarOrganizacaoDto, @Req() req: any) {
        return await this.orgService.criarOrganizacao(body, req);
    }

    @Get(':id/Details')
    @ApiOperation({ operationId: 'GetOrganizacaoDetails' })
    async obterDetalhes(@Param('id') id: string, @Req() req: any) {
        return await this.orgService.obterDetalhesOrganizacao(id, req);
    }

    @Post(':id/Update')
    @ApiOperation({ operationId: 'UpdateOrganizacao' })
    async atualizar(@Param('id') id: string, @Body() body: AtualizarOrganizacaoDto, @Req() req: any) {
        return await this.orgService.atualizarOrganizacao(id, body, req);
    }

    @Get(':id/Roles')
    @ApiOperation({ operationId: 'ListOrganizacaoRoles' })
    async listarRoles(@Param('id') id: string, @Req() req: any) {
        return await this.orgService.listarRoles(id, req);
    }

    @Post(':id/Roles')
    @ApiOperation({ operationId: 'CreateOrganizacaoRole' })
    async criarRole(@Param('id') id: string, @Body() body: CriarOrganizacaoRoleDto, @Req() req: any) {
        return await this.orgService.criarRole(id, body, req);
    }

    @Post(':id/Roles/:roleId/Delete')
    @ApiOperation({ operationId: 'DeleteOrganizacaoRole' })
    async removerRole(@Param('id') id: string, @Param('roleId') roleId: string, @Req() req: any) {
        return await this.orgService.removerRole(id, roleId, req);
    }

    @Get(':id/Members')
    @ApiOperation({ operationId: 'ListOrganizacaoMembers' })
    async listarMembros(@Param('id') id: string, @Req() req: any) {
        return await this.orgService.listarMembros(id, req);
    }

    @Post(':id/Share')
    @ApiOperation({ operationId: 'ShareOrganizacaoTenant' })
    async compartilhar(@Param('id') id: string, @Body() body: CompartilharOrganizacaoDto, @Req() req: any) {
        return await this.orgService.compartilharComUsuario(id, body, req);
    }

    @Post(':id/Members/:memberId/Roles')
    @ApiOperation({ operationId: 'AssignOrganizacaoMemberRoles' })
    async atribuirRolesMembro(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Body() body: AtribuirRolesMembroDto,
        @Req() req: any,
    ) {
        return await this.orgService.atribuirRolesMembro(id, memberId, body?.roles || [], req);
    }

    @Post(':id/Members/:memberId/Remove')
    @ApiOperation({ operationId: 'RemoveOrganizacaoMember' })
    async removerMembro(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Req() req: any,
    ) {
        return await this.orgService.removerMembro(id, memberId, req);
    }
}
