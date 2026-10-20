import { Body, Controller, Post, Request, Query, Optional, Headers } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Application } from "../model/application.entity";
import { ApplicationService } from "../service/application.service";
import { User } from "@ci/auth/models/user.entity";
import { GetInputDtos } from "../dto/input-dto";
import { CatalogAppDto, CanLoadAppDto, CheckVersionDto, ReconcileCatalogDto, ToggleUserActivationDto, GetStoreDto, ToggleGlobalAppDto, InstallGitModuleDto } from "../dto/catalog-app.dto";
import { Role } from "@ci/auth/decorators/role.decorator";
import { Public } from "@ci/auth/decorators/public.decorator";
import { SyncPayloadDao } from "@ci/core";

@ApiTags('Application')
@Controller('Application')
export class ApplicationController {
    constructor(
        private readonly service: ApplicationService
    ) { }

    @Post('Get')
    @ApiResponse({
        type: Application,
        isArray: true, description: 'Obter Aplicações'
    })
    @ApiOperation({
        operationId: 'GetListApplication',
    })
    async get(
        @Request() req: Request,
        @Body() input?: GetInputDtos,
    ) {
        try {
            const user: User = (req as any).user;
            const tenantId = (req as any).headers?.['x-tenant-id'] || (req as any).headers?.['tenant-id'];
            return await this.service.find(
                (user?.roles && user?.roles?.includes('ADMIN') && input?.all) ?
                    undefined : (user?.roles || []),
                tenantId,
                Boolean(input?.all)
            );
        } catch (error) {
            console.trace(error);
        }
    }

    /**
     * Catálogo da Loja de Aplicações com status de ativação da conta do usuário.
     */
    @Public()
    @Post('Store')
    @ApiResponse({
        description: 'Obter catálogo de aplicações da Loja com status de ativação'
    })
    @ApiOperation({
        operationId: 'GetStoreApplications',
    })
    async getStore(
        @Request() req: Request,
        @Body() body?: GetStoreDto
    ) {
        const user: User = (req as any).user;
        return await this.service.getStore(user, body?.search, body?.categoria);
    }

    /**
     * Ativar ou desativar aplicação para a conta do usuário.
     */
    @Post('ToggleActivation')
    @ApiResponse({
        description: 'Ativar ou desativar aplicação para uso na conta do usuário'
    })
    @ApiOperation({
        operationId: 'ToggleApplicationActivation',
    })
    async toggleActivation(
        @Request() req: Request,
        @Body() dto: ToggleUserActivationDto
    ) {
        const user: User = (req as any).user;
        return await this.service.toggleUserActivation(dto, user);
    }

    /**
     * Lista de chaves de aplicações ativadas para o usuário autenticado.
     */
    @Post('MyActivations')
    @ApiResponse({
        description: 'Obter chaves das aplicações ativadas para o usuário'
    })
    @ApiOperation({
        operationId: 'GetMyActivatedApplications',
    })
    async getMyActivations(
        @Request() req: Request
    ) {
        const user: User = (req as any).user;
        return await this.service.getUserActivations(user);
    }

    /**
     * Alternar status global de uma aplicação (Ativar/Desativar para todos os usuários).
     * Restrito a usuários com perfil MASTER + DEVELOPER que sejam colaboradores da aplicação.
     */
    @Post('ToggleGlobalStatus')
    @ApiResponse({
        description: 'Ativar ou desativar aplicação globalmente na plataforma'
    })
    @ApiOperation({
        operationId: 'ToggleGlobalApplicationStatus',
    })
    async toggleGlobalStatus(
        @Request() req: Request,
        @Body() dto: ToggleGlobalAppDto
    ) {
        const user: User = (req as any).user;
        return await this.service.toggleGlobalStatus(dto, user);
    }

    /**
     * Adiciona e instala uma aplicação/lib NestJS a partir de um repositório Git isolado.
     * Restrito a usuários com ROLE DEVELOPER.
     */
    @Role('DEVELOPER')
    @Post('InstallGitModule')
    @ApiResponse({
        description: 'Clonar repositório Git isolado e instalar módulo NestJS da aplicação'
    })
    @ApiOperation({
        operationId: 'InstallGitModuleApplication',
    })
    async installGitModule(
        @Request() req: Request,
        @Body() dto: InstallGitModuleDto
    ) {
        const user: User = (req as any).user;
        return await this.service.installGitModule(dto, user);
    }

    /**
     * Verifica se a versão do cliente atual já foi catalogada.
     */
    @Public()
    @Post('CheckVersion')
    @ApiResponse({
        description: 'Verificar se a versão do cliente foi catalogada'
    })
    @ApiOperation({
        operationId: 'CheckVersionCataloged',
    })
    async checkVersion(
        @Body() dto: CheckVersionDto,
    ) {
        return await this.service.isVersionCataloged(dto.versionHash);
    }

    /**
     * Reconciliação do catálogo de aplicações da versão do cliente:
     * - Cadastra novas aplicações
     * - Atualiza aplicações existentes com metadados e colaboradores
     * - Desativa aplicações removidas do cliente
     * - Apenas usuários com ROLE MASTER têm permissão.
     */
    @Role('MASTER')
    @Post('Reconcile')
    @ApiResponse({
        description: 'Reconciliar catálogo completo de aplicações para a versão'
    })
    @ApiOperation({
        operationId: 'ReconcileApplicationCatalog',
    })
    async reconcile(
        @Body() dto: ReconcileCatalogDto,
        @Request() req: Request
    ) {
        const user: User = (req as any).user;
        return await this.service.reconcileCatalog(dto, user);
    }

    /**
     * Endpoint chamado pelo cliente na execução de uma aplicação hardcoded
     * para registrá-la ou sincronizar o hash de versão Git.
     */
    @Public()
    @Post('Catalog')
    @ApiResponse({
        type: Application,
        description: 'Catalogar aplicação automaticamente na execução'
    })
    @ApiOperation({
        operationId: 'CatalogApplication',
    })
    async catalog(
        @Body() dto: CatalogAppDto,
        @Headers('x-origin-application') originApp?: string,
        @Headers('x-application-git-hash') gitHash?: string,
    ) {
        if (!dto.gitVersionHash && gitHash) {
            dto.gitVersionHash = gitHash;
        }
        return await this.service.catalog(dto);
    }

    /**
     * Verifica se a aplicação pode ser carregada no contexto atual do usuário / tenant.
     */
    @Public()
    @Post('CanLoad')
    @ApiResponse({
        description: 'Verificar permissão contextual de carregamento da aplicação'
    })
    @ApiOperation({
        operationId: 'CanLoadApplication',
    })
    async canLoad(
        @Body() dto: CanLoadAppDto,
        @Request() req: Request
    ) {
        const user: User = (req as any).user;
        const tenantId = dto.tenantId || (req as any).headers?.['x-tenant-id'] || (req as any).headers?.['tenant-id'];
        return await this.service.canLoad(dto.appKey, user, tenantId);
    }

    @Role('MASTER')
    @Post('Sync')
    @ApiResponse({
        type: Application, description: 'Sincronizar Objeto de Aplicação'
    })
    @ApiOperation({
        operationId: 'SyncApplication',
    })
    async sync(
        @Body() application: SyncPayloadDao<Application>,
        @Request() req: Request,
    ) {
        try {
            return await this.service.sync(application.data, req);
        } catch (error) {
            console.trace(error);
            throw error;
        }
    }

    @Role('MASTER')
    @Post('Delete')
    @ApiResponse({
        type: Application, description: 'Excluir Cadastro de Aplicação'
    })
    @ApiOperation({
        operationId: 'DeleteApplication',
    })
    async Delete(
        @Body() application: Application
    ) {
        return await this.service.delete(application.id);
    }
}
