import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Equal, Repository, ILike, In } from "typeorm";
import { Tenant } from "../models/tenant.entity";
import { TenantPermission } from "../models/tenant-permission.entity";
import { Grupo } from "../models/grupo.entity";
import { GrupoMembership } from "../models/grupo-membership.entity";
import { GrupoTopico } from "../models/grupo-topico.entity";
import { GrupoTopicoMensagem } from "../models/grupo-topico-mensagem.entity";
import { GrupoAtivoCompartilhado } from "../models/grupo-ativo-compartilhado.entity";
import { User } from "@ci/auth/models/user.entity";

export interface TenantPermissionFlags {
    canVisualizar: boolean;
    canVer: boolean;
    canEditar: boolean;
    canCompartilhar: boolean;
}

export interface TenantComPermissoesDto extends Tenant {
    permissionsSummary: TenantPermissionFlags;
}

export interface CriarTenantDto {
    name: string;
    descriptions?: string;
    organizacaoId?: string;
    permissions?: Partial<TenantPermissionFlags>;
}

export interface AtualizarTenantDto {
    name?: string;
    descriptions?: string;
    organizacaoId?: string;
}

export interface DefinirPermissaoTenantDto {
    userId?: string;
    emailOrUsername?: string;
    organizacaoId?: string;
    role?: string;
    canVisualizar?: boolean;
    canVer?: boolean;
    canEditar?: boolean;
    canCompartilhar?: boolean;
}

export interface CriarGrupoDto {
    name: string;
    descriptions?: string;
    coverUrl?: string;
    avatarUrl?: string;
    requiresApproval?: boolean;
}

export interface CriarTopicoDto {
    title: string;
    content: string;
}

export interface CompartilharAtivoDto {
    tipoAtivo: 'NOTICIA' | 'FORMULARIO' | 'CADASTRO' | 'DOCUMENTO' | 'OUTRO';
    ativoId: string;
    titulo: string;
    descricao?: string;
    url?: string;
    metadados?: any;
}

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
        @InjectRepository(Grupo)
        private readonly grupoRepo: Repository<Grupo>,
        @InjectRepository(GrupoMembership)
        private readonly membershipRepo: Repository<GrupoMembership>,
        @InjectRepository(GrupoTopico)
        private readonly topicoRepo: Repository<GrupoTopico>,
        @InjectRepository(GrupoTopicoMensagem)
        private readonly mensagemRepo: Repository<GrupoTopicoMensagem>,
        @InjectRepository(GrupoAtivoCompartilhado)
        private readonly ativoRepo: Repository<GrupoAtivoCompartilhado>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @Optional()
        @InjectRepository(TenantPermission)
        private readonly permissionRepo?: Repository<TenantPermission>,
        @Optional()
        private readonly dataSource?: DataSource,
    ) {}

    /**
     * Cria um novo Grupo / Comunidade social.
     * Cada grupo gera seu próprio Tenant isolado para compartilhamento de dados.
     * O criador torna-se Administrador do Grupo e recebe o Tenant associado em user.tenants.
     */
    async criarGrupo(dados: CriarGrupoDto, adminUser: User): Promise<Grupo> {
        if (!dados.name || !dados.name.trim()) {
            throw new BadRequestException('O título do grupo é obrigatório.');
        }

        // 1. Cria o Tenant do grupo
        const tenant = this.tenantRepo.create({
            name: `Tenant: ${dados.name.trim()}`,
            descriptions: `Tenant de dados compartilhados do grupo ${dados.name.trim()}`,
            createdBy: adminUser.id,
        });
        const savedTenant = await this.tenantRepo.save(tenant);

        // 2. Cria a entidade Grupo contendo o Tenant
        const grupo = this.grupoRepo.create({
            name: dados.name.trim(),
            descriptions: dados.descriptions?.trim() || '',
            coverUrl: dados.coverUrl?.trim() || '',
            avatarUrl: dados.avatarUrl?.trim() || '',
            requiresApproval: dados.requiresApproval !== undefined ? dados.requiresApproval : true,
            createdBy: adminUser.id,
            adminId: adminUser.id,
            tenantId: savedTenant.id!,
            tenant: savedTenant,
        });
        const savedGrupo = await this.grupoRepo.save(grupo);

        // 3. Cria a adesão do criador como Administrador Aprovado
        const adminMembership = this.membershipRepo.create({
            grupoId: savedGrupo.id!,
            userId: adminUser.id!,
            role: 'ADMIN',
            status: 'APPROVED',
            approvedAt: new Date(),
        });
        await this.membershipRepo.save(adminMembership);

        // 4. Vincula o Tenant do grupo ao usuário administrador
        await this.adicionarTenantAoUsuario(adminUser.id!, savedTenant);

        return savedGrupo;
    }

    /**
     * Lista grupos com contagem de membros, administradores e status contextual do usuário.
     * Suporta busca por termo insensível a maiúsculas/minúsculas (ILike).
     */
    async listarGrupos(currentUserId?: string, termo?: string, grupoIds?: string[]): Promise<any[]> {
        const whereClause: any = {};
        if (termo && termo.trim()) {
            whereClause.name = ILike(`%${termo.trim()}%`);
        }
        if (grupoIds && grupoIds.length > 0) {
            whereClause.id = In(grupoIds);
        } else if (grupoIds && grupoIds.length === 0) {
            return [];
        }

        const grupos = await this.grupoRepo.find({
            where: whereClause,
            order: { createdAt: 'DESC' },
            relations: ['tenant']
        });

        if (grupos.length === 0) return [];

        const ids = grupos.map(g => g.id!).filter(Boolean);

        // Busca membros e pendências
        const memberships = await this.membershipRepo.find({
            where: { grupoId: In(ids) }
        });

        // Carrega dados e fotos dos administradores
        const adminIds = Array.from(new Set(grupos.map(g => g.adminId || g.createdBy).filter(Boolean))) as string[];
        const admins = adminIds.length > 0 ? await this.userRepo.find({
            where: { id: In(adminIds) },
            relations: ['photo']
        }) : [];
        const adminMap = new Map(admins.map(a => [a.id!, a]));

        return grupos.map(grupo => {
            const groupMemberships = memberships.filter(m => m.grupoId === grupo.id);
            const approvedMembers = groupMemberships.filter(m => m.status === 'APPROVED');
            const pendingRequests = groupMemberships.filter(m => m.status === 'PENDING');

            let userStatus: 'ADMIN' | 'MEMBER' | 'PENDING' | 'NONE' = 'NONE';
            if (currentUserId) {
                if (grupo.adminId === currentUserId || grupo.createdBy === currentUserId) {
                    userStatus = 'ADMIN';
                } else {
                    const userM = groupMemberships.find(m => m.userId === currentUserId);
                    if (userM?.status === 'APPROVED') {
                        userStatus = 'MEMBER';
                    } else if (userM?.status === 'PENDING') {
                        userStatus = 'PENDING';
                    }
                }
            }

            const targetAdminId = grupo.adminId || grupo.createdBy;
            const admin = targetAdminId ? adminMap.get(targetAdminId) : null;

            return {
                id: grupo.id,
                name: grupo.name,
                descriptions: grupo.descriptions,
                coverUrl: grupo.coverUrl,
                avatarUrl: grupo.avatarUrl,
                requiresApproval: grupo.requiresApproval,
                createdBy: grupo.createdBy,
                adminId: grupo.adminId,
                tenantId: grupo.tenantId,
                tenant: grupo.tenant,
                createdAt: grupo.createdAt,
                updatedAt: grupo.updatedAt,
                membersCount: approvedMembers.length,
                pendingCount: userStatus === 'ADMIN' ? pendingRequests.length : 0,
                userStatus,
                admin: admin ? {
                    id: admin.id,
                    username: admin.username,
                    surname: admin.surname,
                    fullName: admin.fullName,
                    photo: admin.photo
                } : null
            };
        });
    }

    /**
     * Retorna detalhes de um grupo específico.
     */
    async obterGrupo(grupoId: string, currentUserId?: string): Promise<any> {
        const grupo = await this.grupoRepo.findOne({
            where: { id: grupoId },
            relations: ['tenant']
        });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        const memberships = await this.membershipRepo.find({
            where: { grupoId }
        });

        const approved = memberships.filter(m => m.status === 'APPROVED');
        const userM = currentUserId ? memberships.find(m => m.userId === currentUserId) : null;

        let userStatus: 'ADMIN' | 'MEMBER' | 'PENDING' | 'NONE' = 'NONE';
        if (currentUserId) {
            if (grupo.adminId === currentUserId || grupo.createdBy === currentUserId) userStatus = 'ADMIN';
            else if (userM?.status === 'APPROVED') userStatus = 'MEMBER';
            else if (userM?.status === 'PENDING') userStatus = 'PENDING';
        }

        const targetAdminId = grupo.adminId || grupo.createdBy;
        const admin = targetAdminId ? await this.userRepo.findOne({
            where: { id: targetAdminId },
            relations: ['photo']
        }) : null;

        return {
            ...grupo,
            membersCount: approved.length,
            userStatus,
            admin: admin ? {
                id: admin.id,
                username: admin.username,
                surname: admin.surname,
                fullName: admin.fullName,
                photo: admin.photo
            } : null
        };
    }

    /**
     * Solicita participação em um grupo.
     * Se o grupo for aberto (não requer aprovação), o usuário já recebe o Tenant do grupo em user.tenants.
     */
    async solicitarParticipacao(grupoId: string, user: User): Promise<{ status: 'APPROVED' | 'PENDING'; message: string }> {
        const grupo = await this.grupoRepo.findOne({
            where: { id: grupoId },
            relations: ['tenant']
        });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        let membership = await this.membershipRepo.findOne({
            where: { grupoId, userId: user.id }
        });

        if (membership && membership.status === 'APPROVED') {
            return { status: 'APPROVED', message: 'Você já é membro deste grupo.' };
        }
        if (membership && membership.status === 'PENDING') {
            return { status: 'PENDING', message: 'Sua solicitação de participação já está aguardando aprovação.' };
        }

        const autoApprove = !grupo.requiresApproval;
        const newStatus = autoApprove ? 'APPROVED' : 'PENDING';

        if (membership) {
            membership.status = newStatus;
            membership.role = 'MEMBER';
            membership.requestedAt = new Date();
            membership.approvedAt = autoApprove ? new Date() : undefined;
            await this.membershipRepo.save(membership);
        } else {
            membership = this.membershipRepo.create({
                grupoId,
                userId: user.id!,
                role: 'MEMBER',
                status: newStatus,
                requestedAt: new Date(),
                approvedAt: autoApprove ? new Date() : undefined,
            });
            await this.membershipRepo.save(membership);
        }

        // Se aprovado automaticamente, adiciona o tenant do grupo aos tenants do usuário
        if (autoApprove && grupo.tenant) {
            await this.adicionarTenantAoUsuario(user.id!, grupo.tenant);
        }

        return {
            status: newStatus,
            message: autoApprove
                ? 'Você ingressou no grupo com sucesso!'
                : 'Solicitação enviada! Aguarde a aprovação do administrador do grupo.'
        };
    }

    /**
     * Permite que um membro saia do grupo ou cancele solicitação.
     * Remove o tenant do grupo dos tenants do usuário.
     */
    async sairDoGrupo(grupoId: string, user: User): Promise<{ message: string }> {
        const grupo = await this.grupoRepo.findOne({ where: { id: grupoId } });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        if (grupo.adminId === user.id) {
            throw new BadRequestException('O administrador não pode sair do grupo. Transfira a administração ou encerre o grupo.');
        }

        await this.membershipRepo.delete({ grupoId, userId: user.id });
        await this.removerTenantDoUsuario(user.id!, grupo.tenantId);

        return { message: 'Você deixou o grupo com sucesso.' };
    }

    /**
     * Lista solicitações pendentes para aprovação pelo administrador.
     */
    async listarSolicitacoesPendentes(grupoId: string, adminUserId: string): Promise<any[]> {
        const grupo = await this.grupoRepo.findOne({ where: { id: grupoId } });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        if (grupo.adminId !== adminUserId && grupo.createdBy !== adminUserId) {
            throw new ForbiddenException('Apenas o administrador do grupo pode visualizar as solicitações.');
        }

        const pendentes = await this.membershipRepo.find({
            where: { grupoId, status: 'PENDING' },
            order: { requestedAt: 'ASC' }
        });

        if (pendentes.length === 0) return [];

        const userIds = pendentes.map(p => p.userId);
        const users = await this.userRepo.find({
            where: { id: In(userIds) },
            relations: ['photo']
        });
        const userMap = new Map(users.map(u => [u.id!, u]));

        return pendentes.map(p => {
            const u = userMap.get(p.userId);
            return {
                id: p.id,
                grupoId: p.grupoId,
                tenantId: grupo.tenantId,
                userId: p.userId,
                requestedAt: p.requestedAt,
                user: u ? {
                    id: u.id,
                    username: u.username,
                    surname: u.surname,
                    fullName: u.fullName,
                    photo: u.photo
                } : null
            };
        });
    }

    /**
     * Responde (aprova ou rejeita) uma solicitação de participação no grupo.
     * Ao aprovar, adiciona o tenant do grupo ao usuário.
     */
    async responderSolicitacao(
        grupoId: string,
        membershipId: string,
        aprovar: boolean,
        adminUserId: string
    ): Promise<{ message: string; status: string }> {
        const grupo = await this.grupoRepo.findOne({
            where: { id: grupoId },
            relations: ['tenant']
        });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        if (grupo.adminId !== adminUserId && grupo.createdBy !== adminUserId) {
            throw new ForbiddenException('Apenas o administrador do grupo pode aprovar ou rejeitar solicitações.');
        }

        const membership = await this.membershipRepo.findOne({ where: { id: membershipId, grupoId } });
        if (!membership) throw new NotFoundException('Solicitação não encontrada.');

        if (aprovar) {
            membership.status = 'APPROVED';
            membership.approvedAt = new Date();
            await this.membershipRepo.save(membership);

            if (grupo.tenant) {
                await this.adicionarTenantAoUsuario(membership.userId, grupo.tenant);
            }
            return { message: 'Solicitação aprovada! O usuário agora é membro do grupo.', status: 'APPROVED' };
        } else {
            membership.status = 'REJECTED';
            await this.membershipRepo.save(membership);
            return { message: 'Solicitação rejeitada.', status: 'REJECTED' };
        }
    }

    /**
     * Retorna apenas os grupos dos quais o usuário é membro ou administrador.
     */
    async meusGrupos(userId: string): Promise<any[]> {
        const memberships = await this.membershipRepo.find({
            where: { userId, status: 'APPROVED' }
        });

        const memberGroupIds = memberships.map(m => m.grupoId);
        const adminGrupos = await this.grupoRepo.find({
            where: [
                { adminId: userId },
                { createdBy: userId }
            ]
        });
        const allIds = Array.from(new Set([...memberGroupIds, ...adminGrupos.map(g => g.id!)]));

        if (allIds.length === 0) return [];

        return this.listarGrupos(userId, undefined, allIds);
    }

    // =========================================================================
    // TÓPICOS DE CONVERSA
    // =========================================================================

    /**
     * Lista os tópicos de discussão do grupo.
     */
    async listarTopicos(grupoId: string): Promise<GrupoTopico[]> {
        return await this.topicoRepo.find({
            where: { grupoId },
            order: { createdAt: 'DESC' }
        });
    }

    /**
     * Cria um novo tópico de discussão no grupo, vinculado ao tenant do grupo.
     */
    async criarTopico(grupoId: string, dados: CriarTopicoDto, user: User): Promise<GrupoTopico> {
        const grupo = await this.grupoRepo.findOne({ where: { id: grupoId } });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        const topico = this.topicoRepo.create({
            grupoId,
            tenantId: grupo.tenantId,
            title: dados.title.trim(),
            content: dados.content.trim(),
            authorId: user.id!,
            authorName: user.fullName || user.username,
            authorPhoto: (user.photo as any)?.url || undefined,
            repliesCount: 0,
        });

        return await this.topicoRepo.save(topico);
    }

    /**
     * Lista as mensagens de resposta de um tópico.
     */
    async listarMensagensTopico(topicoId: string): Promise<GrupoTopicoMensagem[]> {
        return await this.mensagemRepo.find({
            where: { topicoId },
            order: { createdAt: 'ASC' }
        });
    }

    /**
     * Envia uma resposta em um tópico de discussão.
     */
    async responderTopico(topicoId: string, content: string, user: User): Promise<GrupoTopicoMensagem> {
        const topico = await this.topicoRepo.findOne({ where: { id: topicoId } });
        if (!topico) throw new NotFoundException('Tópico não encontrado.');

        const mensagem = this.mensagemRepo.create({
            topicoId,
            authorId: user.id!,
            authorName: user.fullName || user.username,
            authorPhoto: (user.photo as any)?.url || undefined,
            content: content.trim(),
        });
        const saved = await this.mensagemRepo.save(mensagem);

        topico.repliesCount = (topico.repliesCount || 0) + 1;
        await this.topicoRepo.save(topico);

        return saved;
    }

    // =========================================================================
    // COMPARTILHAMENTO DE ATIVOS (FullAuditedEntity via Tenant ID)
    // =========================================================================

    /**
     * Lista os ativos (Notícias, Formulários, etc.) compartilhados com o grupo através de seu tenantId.
     */
    async listarAtivosCompartilhados(grupoId: string): Promise<GrupoAtivoCompartilhado[]> {
        const grupo = await this.grupoRepo.findOne({ where: { id: grupoId } });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        return await this.ativoRepo.find({
            where: { tenantId: grupo.tenantId },
            order: { createdAt: 'DESC' }
        });
    }

    /**
     * Compartilha um ativo com o Grupo associando o tenantId do grupo ao ativo.
     * Os membros que possuem esse tenantId recebem visibilidade do recurso.
     */
    async compartilharAtivo(grupoId: string, dados: CompartilharAtivoDto, user: User): Promise<GrupoAtivoCompartilhado> {
        const grupo = await this.grupoRepo.findOne({ where: { id: grupoId } });
        if (!grupo) throw new NotFoundException('Grupo não encontrado.');

        const ativo = this.ativoRepo.create({
            grupoId,
            tenantId: grupo.tenantId,
            tipoAtivo: dados.tipoAtivo,
            ativoId: dados.ativoId,
            titulo: dados.titulo,
            descricao: dados.descricao || '',
            url: dados.url || '',
            metadados: dados.metadados || null,
            compartilhadoPorId: user.id!,
            compartilhadoPorNome: user.fullName || user.username,
            compartilhadoPorPhoto: (user.photo as any)?.url || undefined,
        });

        return await this.ativoRepo.save(ativo);
    }

    // =========================================================================
    // HELPERS DE TENANT
    // =========================================================================

    private async adicionarTenantAoUsuario(userId: string, tenant: Tenant) {
        try {
            const user = await this.userRepo.findOne({
                where: { id: userId },
                relations: ['tenants']
            });
            if (user) {
                user.tenants = user.tenants || [];
                if (!user.tenants.some(t => t.id === tenant.id)) {
                    user.tenants.push(tenant);
                    await this.userRepo.save(user);
                }
            }
        } catch (e) {
            console.error(`Erro ao adicionar tenant ${tenant.id} ao usuário ${userId}:`, e);
        }
    }

    private async removerTenantDoUsuario(userId: string, tenantId: string) {
        try {
            const user = await this.userRepo.findOne({
                where: { id: userId },
                relations: ['tenants']
            });
            if (user && user.tenants) {
                user.tenants = user.tenants.filter(t => t.id !== tenantId);
                await this.userRepo.save(user);
            }
        } catch (e) {
            console.error(`Erro ao remover tenant ${tenantId} do usuário ${userId}:`, e);
        }
    }

    // =========================================================================
    // GESTÃO DE TENANTS DISPONÍVEIS E PERMISSÕES (TenantPermission)
    // =========================================================================

    private async loadOrganizacaoContext(
        organizacaoId: string | undefined,
        userId: string,
    ): Promise<{ orgTenantId?: string; isOrgAdmin: boolean; isOrgMember: boolean }> {
        if (!organizacaoId || !this.dataSource) {
            return { isOrgAdmin: false, isOrgMember: false };
        }
        try {
            const orgRepo = this.dataSource.getRepository('Organizacao');
            const org: any = await orgRepo.findOne({
                where: { internalId: Equal(organizacaoId) } as any,
                relations: ['createdBy'],
            });
            if (!org) {
                return { isOrgAdmin: false, isOrgMember: false };
            }
            const orgTenantId: string | undefined = org.tenantId || org.tenant?.id;
            const isOwner = org.ownerUserId === userId || org.createdBy?.identifiedUser === userId;

            let isOrgMember = isOwner;
            let isOrgAdmin = isOwner;
            try {
                const membroRepo = this.dataSource.getRepository('OrganizacaoMembro');
                const member: any = await membroRepo.findOne({
                    where: {
                        organizacaoId: Equal(organizacaoId),
                        userId: Equal(userId),
                        status: Equal('ACTIVE'),
                    } as any,
                });
                if (member) {
                    isOrgMember = true;
                    if (member.isOwner || (Array.isArray(member.roles) && member.roles.includes('ORG_ADMIN'))) {
                        isOrgAdmin = true;
                    }
                }
            } catch {
                // OrganizacaoMembro pode não estar carregado em testes unitários isolados
            }
            return { orgTenantId, isOrgAdmin, isOrgMember };
        } catch {
            return { isOrgAdmin: false, isOrgMember: false };
        }
    }

    private resolverPermissoesEfetivas(
        tenant: Tenant,
        user: User,
        permsForTenant: TenantPermission[],
        options?: { isOrgAdmin?: boolean; isOrgMember?: boolean; isUserTenantLinked?: boolean; orgTenantId?: string },
    ): TenantPermissionFlags {
        const userRoles = Array.isArray(user?.roles) ? user.roles : [];
        const isPlatformAdmin = userRoles.includes('MASTER') || userRoles.includes('ADMIN');
        const isCreator = Boolean(user?.id && tenant.createdBy === user.id);
        const isOrgAdmin = Boolean(options?.isOrgAdmin);

        if (isPlatformAdmin || isCreator || isOrgAdmin) {
            return {
                canVisualizar: true,
                canVer: true,
                canEditar: true,
                canCompartilhar: true,
            };
        }

        const matchingPerms = (permsForTenant || []).filter(p => {
            const matchesUser = Boolean(p.userId && user?.id && p.userId === user.id);
            const matchesRole = Boolean(p.role && userRoles.includes(p.role));
            const matchesOrgGeneral = Boolean(!p.userId && !p.role && p.organizacaoId && options?.isOrgMember);
            return matchesUser || matchesRole || matchesOrgGeneral;
        });

        if (matchingPerms.length > 0) {
            return matchingPerms.reduce<TenantPermissionFlags>(
                (acc, curr) => ({
                    canVisualizar: acc.canVisualizar || Boolean(curr.canVisualizar),
                    canVer: acc.canVer || Boolean(curr.canVer),
                    canEditar: acc.canEditar || Boolean(curr.canEditar),
                    canCompartilhar: acc.canCompartilhar || Boolean(curr.canCompartilhar),
                }),
                { canVisualizar: false, canVer: false, canEditar: false, canCompartilhar: false },
            );
        }

        if (options?.isUserTenantLinked || (options?.orgTenantId && options.orgTenantId === tenant.id && options?.isOrgMember)) {
            return {
                canVisualizar: true,
                canVer: true,
                canEditar: false,
                canCompartilhar: false,
            };
        }

        return {
            canVisualizar: false,
            canVer: false,
            canEditar: false,
            canCompartilhar: false,
        };
    }

    /**
     * Lista todos os Tenants disponíveis para o usuário (opcionalmente filtrados por Organização),
     * já incluindo as permissões efetivas (visualizar, ver, editar e compartilhar).
     */
    async listarTenantsDisponiveis(
        user: User,
        organizacaoId?: string,
    ): Promise<TenantComPermissoesDto[]> {
        if (!user?.id) {
            throw new BadRequestException('Usuário autenticado não identificado.');
        }

        const dbUser = await this.userRepo.findOne({
            where: { id: user.id },
            relations: ['tenants'],
        });
        const userTenants = dbUser?.tenants || user.tenants || [];
        const userTenantIds = new Set(userTenants.map(t => t.id).filter(Boolean) as string[]);

        const orgCtx = await this.loadOrganizacaoContext(organizacaoId, user.id);

        const permissionRows = this.permissionRepo
            ? await this.permissionRepo.find({
                where: organizacaoId
                    ? [
                        { userId: Equal(user.id) },
                        { organizacaoId: Equal(organizacaoId) },
                    ]
                    : [{ userId: Equal(user.id) }],
            })
            : [];

        const permTenantIds = new Set(permissionRows.map(p => p.tenantId).filter(Boolean));
        const tenantMap = new Map<string, Tenant>();

        for (const t of userTenants) {
            if (t?.id) tenantMap.set(t.id, t);
        }

        const queryClauses: any[] = [{ createdBy: Equal(user.id) }];
        if (organizacaoId) {
            queryClauses.push({ organizacaoId: Equal(organizacaoId) });
        }
        if (orgCtx.orgTenantId) {
            queryClauses.push({ id: Equal(orgCtx.orgTenantId) });
        }
        if (permTenantIds.size > 0) {
            queryClauses.push({ id: In(Array.from(permTenantIds)) });
        }

        const queriedTenants = await this.tenantRepo.find({ where: queryClauses });
        for (const t of queriedTenants) {
            if (t?.id) tenantMap.set(t.id, t);
        }

        const result: TenantComPermissoesDto[] = [];
        for (const tenant of tenantMap.values()) {
            if (!tenant.id) continue;
            const permsForTenant = permissionRows.filter(p => p.tenantId === tenant.id);

            if (organizacaoId) {
                const belongsToOrg =
                    tenant.organizacaoId === organizacaoId ||
                    (orgCtx.orgTenantId && tenant.id === orgCtx.orgTenantId) ||
                    permsForTenant.some(p => p.organizacaoId === organizacaoId);
                if (!belongsToOrg) {
                    continue;
                }
            }

            const permissionsSummary = this.resolverPermissoesEfetivas(tenant, dbUser || user, permsForTenant, {
                isOrgAdmin: orgCtx.isOrgAdmin,
                isOrgMember: orgCtx.isOrgMember,
                isUserTenantLinked: userTenantIds.has(tenant.id),
                orgTenantId: orgCtx.orgTenantId,
            });

            if (!permissionsSummary.canVisualizar && !permissionsSummary.canVer) {
                continue;
            }

            result.push({
                ...tenant,
                permissionsSummary,
            });
        }

        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return result;
    }

    /**
     * Cria um novo Tenant e atribui permissão integral (visualizar, ver, editar, compartilhar) ao criador.
     */
    async criarTenant(dados: CriarTenantDto, user: User): Promise<TenantComPermissoesDto> {
        if (!user?.id) {
            throw new BadRequestException('Usuário autenticado não identificado.');
        }
        const cleanName = (dados?.name || '').trim();
        if (!cleanName) {
            throw new BadRequestException('O nome do Tenant é obrigatório.');
        }

        const created = this.tenantRepo.create({
            name: cleanName,
            descriptions: dados?.descriptions?.trim() || '',
            organizacaoId: dados?.organizacaoId?.trim() || undefined,
            createdBy: user.id,
        });
        const savedTenant = await this.tenantRepo.save(created);
        await this.adicionarTenantAoUsuario(user.id, savedTenant);

        const defaultPerms: TenantPermissionFlags = {
            canVisualizar: dados?.permissions?.canVisualizar ?? true,
            canVer: dados?.permissions?.canVer ?? true,
            canEditar: dados?.permissions?.canEditar ?? true,
            canCompartilhar: dados?.permissions?.canCompartilhar ?? true,
        };

        if (this.permissionRepo && savedTenant.id) {
            const perm = this.permissionRepo.create({
                tenantId: savedTenant.id,
                userId: user.id,
                organizacaoId: savedTenant.organizacaoId,
                ...defaultPerms,
                grantedBy: user.id,
            });
            await this.permissionRepo.save(perm);
        }

        return {
            ...savedTenant,
            permissionsSummary: defaultPerms,
        };
    }

    private async resolveTenantAccessForUser(
        tenantId: string,
        user: User,
        organizacaoIdOverride?: string,
    ): Promise<{
        tenant: Tenant;
        permsForTenant: TenantPermission[];
        summary: TenantPermissionFlags;
    }> {
        if (!user?.id) {
            throw new BadRequestException('Usuário autenticado não identificado.');
        }
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new NotFoundException('Tenant não encontrado.');
        }

        const effectiveOrgId = organizacaoIdOverride || tenant.organizacaoId;
        const orgCtx = await this.loadOrganizacaoContext(effectiveOrgId, user.id);
        const permsForTenant = this.permissionRepo
            ? await this.permissionRepo.find({ where: { tenantId } })
            : [];
        const dbUser = await this.userRepo.findOne({ where: { id: user.id }, relations: ['tenants'] });
        const userTenantIds = new Set((dbUser?.tenants || []).map(t => t.id).filter(Boolean) as string[]);

        const summary = this.resolverPermissoesEfetivas(tenant, dbUser || user, permsForTenant, {
            isOrgAdmin: orgCtx.isOrgAdmin,
            isOrgMember: orgCtx.isOrgMember,
            isUserTenantLinked: userTenantIds.has(tenantId),
            orgTenantId: orgCtx.orgTenantId,
        });

        return { tenant, permsForTenant, summary };
    }

    /**
     * Atualiza dados de um Tenant existente quando o usuário possui permissão de edição (`canEditar`).
     */
    async atualizarTenant(
        tenantId: string,
        dados: AtualizarTenantDto,
        user: User,
    ): Promise<TenantComPermissoesDto> {
        const { tenant, summary: permissionsSummary } = await this.resolveTenantAccessForUser(
            tenantId,
            user,
            dados?.organizacaoId,
        );

        if (!permissionsSummary.canEditar) {
            throw new ForbiddenException('Você não possui permissão de edição para este Tenant.');
        }

        if (dados?.name !== undefined) {
            const cleanName = dados.name.trim();
            if (!cleanName) {
                throw new BadRequestException('O nome do Tenant não pode ser vazio.');
            }
            tenant.name = cleanName;
        }
        if (dados?.descriptions !== undefined) {
            tenant.descriptions = dados.descriptions.trim();
        }
        if (dados?.organizacaoId !== undefined) {
            tenant.organizacaoId = dados.organizacaoId?.trim() || undefined;
        }

        const saved = await this.tenantRepo.save(tenant);
        return {
            ...saved,
            permissionsSummary,
        };
    }

    /**
     * Lista todas as permissões cadastradas para um Tenant.
     */
    async listarPermissoesTenant(tenantId: string, user: User): Promise<TenantPermission[]> {
        const { permsForTenant, summary } = await this.resolveTenantAccessForUser(tenantId, user);

        if (!summary.canVisualizar && !summary.canVer && !summary.canCompartilhar) {
            throw new ForbiddenException('Sem permissão para visualizar permissões deste Tenant.');
        }

        return permsForTenant;
    }

    /**
     * Define ou atualiza permissões (`canVisualizar`, `canVer`, `canEditar`, `canCompartilhar`) em um Tenant.
     */
    async definirPermissaoTenant(
        tenantId: string,
        dados: DefinirPermissaoTenantDto,
        user: User,
    ): Promise<TenantPermission> {
        if (!this.permissionRepo) {
            throw new BadRequestException('Repositório de permissões de Tenant indisponível.');
        }
        const { tenant, permsForTenant, summary } = await this.resolveTenantAccessForUser(
            tenantId,
            user,
            dados?.organizacaoId,
        );

        if (!summary.canCompartilhar) {
            throw new ForbiddenException('Você não possui permissão para compartilhar ou gerenciar permissões deste Tenant.');
        }

        let targetUser: User | null = null;
        if (dados?.userId) {
            targetUser = await this.userRepo.findOne({ where: { id: dados.userId } });
        } else if (dados?.emailOrUsername?.trim()) {
            const term = dados.emailOrUsername.trim();
            targetUser = await this.userRepo.findOne({
                where: [{ email: term }, { username: term }],
            });
        }

        if ((dados?.userId || dados?.emailOrUsername) && !targetUser) {
            throw new NotFoundException('Usuário destino não encontrado para concessão de permissão.');
        }

        const targetUserId = targetUser?.id || dados?.userId || undefined;
        const targetOrgId = dados?.organizacaoId?.trim() || tenant.organizacaoId || undefined;
        const targetRole = dados?.role?.trim() || undefined;

        if (!targetUserId && !targetOrgId && !targetRole) {
            throw new BadRequestException('Informe um usuário, organização ou role para atribuir permissão no Tenant.');
        }

        const existing = permsForTenant.find(p =>
            (targetUserId ? p.userId === targetUserId : !p.userId) &&
            (targetOrgId ? p.organizacaoId === targetOrgId : !p.organizacaoId) &&
            (targetRole ? p.role === targetRole : !p.role),
        );

        const nextFlags: TenantPermissionFlags = {
            canVisualizar: dados?.canVisualizar !== undefined ? Boolean(dados.canVisualizar) : (existing?.canVisualizar ?? true),
            canVer: dados?.canVer !== undefined ? Boolean(dados.canVer) : (existing?.canVer ?? true),
            canEditar: dados?.canEditar !== undefined ? Boolean(dados.canEditar) : (existing?.canEditar ?? false),
            canCompartilhar: dados?.canCompartilhar !== undefined ? Boolean(dados.canCompartilhar) : (existing?.canCompartilhar ?? false),
        };

        const entity = existing
            ? Object.assign(existing, {
                ...nextFlags,
                grantedBy: user.id,
            })
            : this.permissionRepo.create({
                tenantId,
                userId: targetUserId,
                organizacaoId: targetOrgId,
                role: targetRole,
                ...nextFlags,
                grantedBy: user.id,
            });

        const savedPerm = await this.permissionRepo.save(entity);

        if (targetUserId) {
            if (nextFlags.canVisualizar || nextFlags.canVer) {
                await this.adicionarTenantAoUsuario(targetUserId, tenant);
            } else {
                await this.removerTenantDoUsuario(targetUserId, tenantId);
            }
        }

        return savedPerm;
    }

    /**
     * Remove uma permissão específica de um Tenant.
     */
    async removerPermissaoTenant(
        tenantId: string,
        permissionId: string,
        user: User,
    ): Promise<{ removed: boolean }> {
        if (!this.permissionRepo) {
            throw new BadRequestException('Repositório de permissões de Tenant indisponível.');
        }

        const { permsForTenant, summary } = await this.resolveTenantAccessForUser(tenantId, user);

        if (!summary.canCompartilhar) {
            throw new ForbiddenException('Sem permissão para remover acessos deste Tenant.');
        }

        const targetPerm = permsForTenant.find(p => p.id === permissionId);
        if (!targetPerm) {
            throw new NotFoundException('Permissão não encontrada.');
        }

        await this.permissionRepo.delete({ id: permissionId } as any);
        return { removed: true };
    }
}
