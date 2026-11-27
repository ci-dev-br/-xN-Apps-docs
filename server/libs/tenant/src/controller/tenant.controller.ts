import { Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    AtualizarTenantDto,
    CompartilharAtivoDto,
    CriarGrupoDto,
    CriarTenantDto,
    CriarTopicoDto,
    DefinirPermissaoTenantDto,
    TenantService,
} from "../service/tenant.service";
import { Tenant } from "../models/tenant.entity";
import { TenantPermission } from "../models/tenant-permission.entity";
import { Grupo } from "../models/grupo.entity";
import { GrupoTopico } from "../models/grupo-topico.entity";
import { GrupoTopicoMensagem } from "../models/grupo-topico-mensagem.entity";
import { GrupoAtivoCompartilhado } from "../models/grupo-ativo-compartilhado.entity";
import { Public } from "@ci/auth/decorators/public.decorator";

@ApiTags('Tenant')
@Controller('Tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}

    /**
     * Lista todos os grupos sociais disponíveis, suportando busca por termo.
     */
    @Public()
    @Get('Groups')
    @ApiOperation({ operationId: 'TenantListGroups' })
    async listarGrupos(@Query('termo') termo: string, @Req() req: any) {
        const currentUserId = req.user?.id;
        return await this.tenantService.listarGrupos(currentUserId, termo);
    }

    /**
     * Retorna os grupos dos quais o usuário autenticado participa ou administra.
     */
    @Get('Groups/My')
    @ApiOperation({ operationId: 'TenantMyGroups' })
    async meusGrupos(@Req() req: any) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new UnauthorizedException('É necessário estar autenticado para consultar seus grupos.');
        }
        return await this.tenantService.meusGrupos(currentUserId);
    }

    /**
     * Retorna detalhes de um grupo específico.
     */
    @Public()
    @Get('Groups/:id')
    @ApiOperation({ operationId: 'TenantGetGroup' })
    async obterGrupo(@Param('id') id: string, @Req() req: any) {
        const currentUserId = req.user?.id;
        return await this.tenantService.obterGrupo(id, currentUserId);
    }

    /**
     * Cria um novo grupo / comunidade com título, descrição, foto de capa e imagem/avatar.
     * Gera e associa um Tenant específico ao grupo.
     */
    @Post('Groups')
    @ApiOperation({ operationId: 'TenantCreateGroup' })
    @ApiResponse({ type: Grupo })
    async criarGrupo(@Body() payload: CriarGrupoDto, @Req() req: any) {
        const currentUser = req.user;
        if (!currentUser?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para criar um grupo.');
        }
        return await this.tenantService.criarGrupo(payload, currentUser);
    }

    /**
     * Solicita participação em um grupo.
     */
    @Post('Groups/:id/Join')
    @ApiOperation({ operationId: 'TenantJoinGroup' })
    async solicitarParticipacao(@Param('id') grupoId: string, @Req() req: any) {
        const currentUser = req.user;
        if (!currentUser?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para solicitar participação.');
        }
        return await this.tenantService.solicitarParticipacao(grupoId, currentUser);
    }

    /**
     * Deixa de participar de um grupo ou cancela a solicitação.
     */
    @Post('Groups/:id/Leave')
    @ApiOperation({ operationId: 'TenantLeaveGroup' })
    async sairDoGrupo(@Param('id') grupoId: string, @Req() req: any) {
        const currentUser = req.user;
        if (!currentUser?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para sair do grupo.');
        }
        return await this.tenantService.sairDoGrupo(grupoId, currentUser);
    }

    /**
     * Lista solicitações pendentes de novos participantes (apenas administrador).
     */
    @Get('Groups/:id/Requests')
    @ApiOperation({ operationId: 'TenantListRequests' })
    async listarSolicitacoes(@Param('id') grupoId: string, @Req() req: any) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new UnauthorizedException('É necessário estar autenticado para acessar as solicitações.');
        }
        return await this.tenantService.listarSolicitacoesPendentes(grupoId, currentUserId);
    }

    /**
     * Responde (aprova ou rejeita) uma solicitação de participação no grupo.
     */
    @Post('Groups/:id/Requests/:requestId/Respond')
    @ApiOperation({ operationId: 'TenantRespondRequest' })
    async responderSolicitacao(
        @Param('id') grupoId: string,
        @Param('requestId') requestId: string,
        @Body() body: { aprovar: boolean },
        @Req() req: any
    ) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new UnauthorizedException('É necessário estar autenticado para gerenciar solicitações.');
        }
        return await this.tenantService.responderSolicitacao(grupoId, requestId, !!body?.aprovar, currentUserId);
    }

    // =========================================================================
    // ENDPOINTS DE TÓPICOS DE CONVERSA
    // =========================================================================

    /**
     * Lista tópicos de conversa de um grupo.
     */
    @Public()
    @Get('Groups/:id/Topics')
    @ApiOperation({ operationId: 'TenantListTopics' })
    @ApiResponse({ type: [GrupoTopico] })
    async listarTopicos(@Param('id') grupoId: string) {
        return await this.tenantService.listarTopicos(grupoId);
    }

    /**
     * Cria um novo tópico de discussão no grupo.
     */
    @Post('Groups/:id/Topics')
    @ApiOperation({ operationId: 'TenantCreateTopic' })
    @ApiResponse({ type: GrupoTopico })
    async criarTopico(@Param('id') grupoId: string, @Body() body: CriarTopicoDto, @Req() req: any) {
        const currentUser = req.user;
        if (!currentUser?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para criar um tópico.');
        }
        return await this.tenantService.criarTopico(grupoId, body, currentUser);
    }

    /**
     * Lista mensagens de um tópico.
     */
    @Public()
    @Get('Groups/:id/Topics/:topicId/Messages')
    @ApiOperation({ operationId: 'TenantListTopicMessages' })
    @ApiResponse({ type: [GrupoTopicoMensagem] })
    async listarMensagensTopico(@Param('topicId') topicId: string) {
        return await this.tenantService.listarMensagensTopico(topicId);
    }

    /**
     * Envia uma resposta em um tópico de conversa.
     */
    @Post('Groups/:id/Topics/:topicId/Messages')
    @ApiOperation({ operationId: 'TenantReplyTopic' })
    @ApiResponse({ type: GrupoTopicoMensagem })
    async responderTopico(
        @Param('topicId') topicId: string,
        @Body() body: { content: string },
        @Req() req: any
    ) {
        const currentUser = req.user;
        if (!currentUser?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para responder ao tópico.');
        }
        return await this.tenantService.responderTopico(topicId, body?.content || '', currentUser);
    }

    // =========================================================================
    // ENDPOINTS DE ATIVOS COMPARTILHADOS (FullAuditedEntity via Tenant ID)
    // =========================================================================

    /**
     * Lista os ativos (Notícias, Formulários, Cadastros) compartilhados com o grupo via Tenant.
     */
    @Public()
    @Get('Groups/:id/SharedAssets')
    @ApiOperation({ operationId: 'TenantListSharedAssets' })
    @ApiResponse({ type: [GrupoAtivoCompartilhado] })
    async listarAtivosCompartilhados(@Param('id') grupoId: string) {
        return await this.tenantService.listarAtivosCompartilhados(grupoId);
    }

    /**
     * Compartilha um ativo com o Grupo, associando o Tenant do grupo ao ativo.
     */
    @Post('Groups/:id/SharedAssets')
    @ApiOperation({ operationId: 'TenantShareAsset' })
    @ApiResponse({ type: GrupoAtivoCompartilhado })
    async compartilharAtivo(
        @Param('id') grupoId: string,
        @Body() body: CompartilharAtivoDto,
        @Req() req: any
    ) {
        const currentUser = req.user;
        if (!currentUser?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para compartilhar um ativo.');
        }
        return await this.tenantService.compartilharAtivo(grupoId, body, currentUser);
    }

    // =========================================================================
    // ENDPOINTS DE GESTÃO DE TENANTS E PERMISSÕES GRANULARES
    // =========================================================================

    @Get('Available')
    @ApiOperation({ operationId: 'TenantListAvailable' })
    @ApiQuery({ name: 'organizacaoId', type: String, required: false })
    @ApiResponse({ type: [Tenant] })
    async listarTenantsDisponiveis(
        @Query('organizacaoId') organizacaoId?: string,
        @Req() req?: any,
    ) {
        if (!req?.user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para listar tenants disponíveis.');
        }
        return await this.tenantService.listarTenantsDisponiveis(req.user, organizacaoId);
    }

    @Post()
    @ApiOperation({ operationId: 'TenantCreate' })
    @ApiResponse({ type: Tenant })
    async criarTenant(
        @Body() body: CriarTenantDto,
        @Req() req: any,
    ) {
        if (!req?.user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para criar um tenant.');
        }
        return await this.tenantService.criarTenant(body, req.user);
    }

    @Post(':id/Update')
    @ApiOperation({ operationId: 'TenantUpdate' })
    @ApiResponse({ type: Tenant })
    async atualizarTenant(
        @Param('id') tenantId: string,
        @Body() body: AtualizarTenantDto,
        @Req() req: any,
    ) {
        if (!req?.user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para editar um tenant.');
        }
        return await this.tenantService.atualizarTenant(tenantId, body, req.user);
    }

    @Get(':id/Permissions')
    @ApiOperation({ operationId: 'TenantListPermissions' })
    @ApiResponse({ type: [TenantPermission] })
    async listarPermissoesTenant(
        @Param('id') tenantId: string,
        @Req() req: any,
    ) {
        if (!req?.user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para consultar permissões do tenant.');
        }
        return await this.tenantService.listarPermissoesTenant(tenantId, req.user);
    }

    @Post(':id/Permissions')
    @ApiOperation({ operationId: 'TenantUpsertPermission' })
    @ApiResponse({ type: TenantPermission })
    async definirPermissaoTenant(
        @Param('id') tenantId: string,
        @Body() body: DefinirPermissaoTenantDto,
        @Req() req: any,
    ) {
        if (!req?.user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para gerenciar permissões do tenant.');
        }
        return await this.tenantService.definirPermissaoTenant(tenantId, body, req.user);
    }

    @Post(':id/Permissions/:permissionId/Delete')
    @ApiOperation({ operationId: 'TenantDeletePermission' })
    async removerPermissaoTenant(
        @Param('id') tenantId: string,
        @Param('permissionId') permissionId: string,
        @Req() req: any,
    ) {
        if (!req?.user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado para remover permissões do tenant.');
        }
        return await this.tenantService.removerPermissaoTenant(tenantId, permissionId, req.user);
    }
}
