import { Body, Controller, ForbiddenException, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@ci/auth/auth.module";
import { User } from "@ci/auth/models/user.entity";
import { Role } from "@ci/auth/decorators/role.decorator";
import { GetListUserDto, UserTenantAddDto, UserTenantRemoveDto } from "../dto/user-manager.dto";

@ApiTags('User')
@Controller('User')
export class UserController {
    constructor(
        private readonly user?: UserService,
    ) { }

    private getActorWithCombinedRoles(req: any): User {
        const actor: User | undefined = req?.user;
        if (!actor?.id) {
            throw new UnauthorizedException('Usuário autenticado não identificado.');
        }
        const combinedRoles: string[] = Array.isArray(req?.combinedRoles)
            ? req.combinedRoles
            : (Array.isArray(actor.roles) ? actor.roles : []);
        return { ...actor, roles: combinedRoles };
    }

    private extractRequestedTenantIds(filter?: GetListUserDto, req?: any): string[] {
        const raw: string[] = [];
        if (Array.isArray(filter?.tenantIds)) {
            raw.push(...filter.tenantIds);
        }
        if (filter?.tenantId) {
            raw.push(filter.tenantId);
        }
        const headerVal = req?.headers?.['x-tenant-id'];
        if (typeof headerVal === 'string' && headerVal.trim()) {
            raw.push(...headerVal.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
        return Array.from(new Set(raw.map(v => (v || '').trim()).filter(Boolean)));
    }

    /**
     * Sincroniza as informações do usuário (auto-edição pelo próprio usuário ou gerenciamento por MASTER/ADMIN).
     */
    @Post('Sync')
    @ApiOperation({ operationId: 'SyncUser' })
    @ApiResponse({
        type: User,
    })
    async sync(
        @Req() req: any,
        @Body() user: User,
    ) {
        const payload: User = ((user as any)?.data ? (user as any).data : user) as User;
        const actor = req?.user ? this.getActorWithCombinedRoles(req) : undefined;
        if (actor) {
            const roles = actor.roles || [];
            const isManager = roles.includes('MASTER') || roles.includes('GOODNESS') || roles.includes('ADMIN');
            if (isManager) {
                return await this.user.sync(payload, actor);
            }
            if (payload?.id && payload.id !== actor.id) {
                throw new ForbiddenException('Você só pode atualizar as informações do próprio perfil.');
            }
            payload.id = actor.id;
            return await this.user.sync(payload, actor);
        }
        if (payload?.id) {
            return await this.user.sync(payload);
        }
        throw new UnauthorizedException('Usuário autenticado não identificado.');
    }

    /**
     * Obtém a lista de usuários visíveis ao usuário autenticado (MASTER: global; ADMIN: tenants disponíveis).
     */
    @Role('MASTER', 'GOODNESS', 'ADMIN')
    @Post('GetList')
    @ApiOperation({ operationId: 'GetListUser' })
    @ApiBody({ type: GetListUserDto, required: false })
    @ApiResponse({
        type: User,
        isArray: true,
    })
    async getList(
        @Req() req: any,
        @Body() filter?: GetListUserDto,
    ) {
        const actor = this.getActorWithCombinedRoles(req);
        const tenantIds = this.extractRequestedTenantIds(filter, req);
        return await this.user.find(tenantIds, { ...req, user: actor }, {
            role: filter?.role,
            search: filter?.search,
        });
    }

    /**
     * Vincula um usuário existente a um Tenant disponível para o administrador.
     */
    @Role('MASTER', 'GOODNESS', 'ADMIN')
    @Post('AddToTenant')
    @ApiOperation({ operationId: 'AddUserToTenant' })
    @ApiBody({ type: UserTenantAddDto })
    @ApiResponse({ type: User })
    async addToTenant(
        @Req() req: any,
        @Body() body: UserTenantAddDto,
    ) {
        const actor = this.getActorWithCombinedRoles(req);
        return await this.user.addUserToTenant(body, actor);
    }

    /**
     * Remove o vínculo de um usuário com um Tenant disponível para o administrador.
     */
    @Role('MASTER', 'GOODNESS', 'ADMIN')
    @Post('RemoveFromTenant')
    @ApiOperation({ operationId: 'RemoveUserFromTenant' })
    @ApiBody({ type: UserTenantRemoveDto })
    @ApiResponse({ type: User })
    async removeFromTenant(
        @Req() req: any,
        @Body() body: UserTenantRemoveDto,
    ) {
        const actor = this.getActorWithCombinedRoles(req);
        return await this.user.removeUserFromTenant(body, actor);
    }
}