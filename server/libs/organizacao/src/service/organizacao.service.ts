import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
} from "@nestjs/common";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Organizacao } from "../model/organizacao.entity";
import { OrganizacaoMembro } from "../model/organizacao-membro.entity";
import { OrganizacaoRole } from "../model/organizacao-role.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Equal, In, IsNull, Repository } from "typeorm";
import { Tenant } from "@ci/tenant/models/tenant.entity";
import { User } from "@ci/auth/models/user.entity";
import {
    AtualizarOrganizacaoDto,
    CompartilharOrganizacaoDto,
    CriarOrganizacaoDto,
    CriarOrganizacaoRoleDto,
} from "../dto/organizacao-workspace.dto";

@Injectable()
export class OrganizacaoService extends DaoFullAuditedServiceBase<Organizacao> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Organizacao)
        repository: Repository<Organizacao>,
        @Optional()
        @InjectRepository(OrganizacaoMembro)
        private readonly membroRepo?: Repository<OrganizacaoMembro>,
        @Optional()
        @InjectRepository(OrganizacaoRole)
        private readonly roleRepo?: Repository<OrganizacaoRole>,
        @Optional()
        @InjectRepository(Tenant)
        private readonly tenantRepo?: Repository<Tenant>,
        @Optional()
        @InjectRepository(User)
        private readonly userRepo?: Repository<User>,
        @Optional()
        private readonly dataSource?: DataSource,
    ) {
        super(snap, repository);
    }

    /**
     * Normaliza um nome personalizado para o formato padrão com prefixo "ORG".
     * Ex.: "Financeiro" -> "ORG_FINANCEIRO", "ORG_VENDAS" -> "ORG_VENDAS".
     */
    public normalizeOrgRoleCode(rawName: string): { code: string; customName: string } {
        const trimmed = (rawName || '').trim();
        if (!trimmed) {
            throw new BadRequestException('Informe o nome personalizado do role.');
        }

        const ascii = trimmed
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_\-\s]+/g, '')
            .trim()
            .replace(/[\s\-]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');

        const upper = ascii.toUpperCase();
        if (!upper || upper === 'ORG' || upper === 'ORG_') {
            throw new BadRequestException('Informe um nome personalizado válido após o prefixo ORG.');
        }

        let code: string;
        let customName: string;

        if (upper.startsWith('ORG_')) {
            code = upper;
            customName = trimmed.replace(/^org[_\-\s]*/i, '').trim() || upper.slice(4);
        } else if (upper.startsWith('ORG') && upper.length > 3) {
            code = upper;
            customName = trimmed.replace(/^org[_\-\s]*/i, '').trim() || upper.slice(3);
        } else {
            code = `ORG_${upper}`;
            customName = trimmed;
        }

        return { code, customName };
    }

    private async ensureTenantForOrganizacao(org: Organizacao, ownerUser?: User): Promise<Tenant | undefined> {
        if (org.tenant && org.tenant.id) {
            if (!org.tenantId) {
                org.tenantId = org.tenant.id;
                await this._repo.save(org);
            }
            return org.tenant;
        }
        if (org.tenantId && this.tenantRepo) {
            const existing = await this.tenantRepo.findOne({ where: { id: org.tenantId } });
            if (existing) {
                org.tenant = existing;
                await this._repo.save(org);
                return existing;
            }
        }
        if (!this.tenantRepo) return undefined;

        const orgLabel = (org.organizatioName || 'Organização').trim();
        const tenant = this.tenantRepo.create({
            name: `ORG: ${orgLabel}`,
            descriptions: `Tenant de compartilhamento da organização ${orgLabel}`,
            createdBy: ownerUser?.id || org.ownerUserId,
        });
        const savedTenant = await this.tenantRepo.save(tenant);
        org.tenant = savedTenant;
        org.tenantId = savedTenant.id;
        org.tenants = [savedTenant];
        await this._repo.save(org);
        return savedTenant;
    }

    private async ensureDefaultOrgRoles(organizacaoId: string, createdByUserId?: string): Promise<OrganizacaoRole[]> {
        if (!this.roleRepo) return [];
        const existing = await this.roleRepo.find({
            where: { organizacaoId: Equal(organizacaoId), deleted: IsNull() },
            order: { createdAt: 'ASC' },
        });
        const defaults = [
            { code: 'ORG_ADMIN', customName: 'Administrador', description: 'Administra membros, compartilhamento via tenant e roles da organização.' },
            { code: 'ORG_MEMBRO', customName: 'Membro', description: 'Acesso padrão aos recursos compartilhados da organização via tenant.' },
        ];
        const created: OrganizacaoRole[] = [];
        for (const def of defaults) {
            if (!existing.some(r => r.code === def.code)) {
                const entity = this.roleRepo.create({
                    organizacaoId,
                    code: def.code,
                    customName: def.customName,
                    description: def.description,
                    createdByUserId,
                });
                created.push(await this.roleRepo.save(entity));
            }
        }
        return [...existing, ...created];
    }

    private async adicionarTenantAoUsuario(userId: string, tenant?: Tenant): Promise<void> {
        if (!userId || !tenant?.id || !this.userRepo) return;
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['tenants'],
        });
        if (!user) return;
        user.tenants = user.tenants || [];
        if (!user.tenants.some(t => t.id === tenant.id)) {
            user.tenants.push(tenant);
            await this.userRepo.save(user);
        }
    }

    private async removerTenantDoUsuario(userId: string, tenantId?: string): Promise<void> {
        if (!userId || !tenantId || !this.userRepo) return;
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['tenants'],
        });
        if (!user || !user.tenants) return;
        user.tenants = user.tenants.filter(t => t.id !== tenantId);
        await this.userRepo.save(user);
    }

    private async sincronizarOrgRolesNoUsuario(userId: string): Promise<string[]> {
        if (!userId || !this.userRepo || !this.membroRepo) return [];
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) return [];

        const memberships = await this.membroRepo.find({
            where: {
                userId: Equal(userId),
                status: Equal('ACTIVE'),
                deleted: IsNull(),
            },
        });

        const activeOrgRoles = new Set<string>();
        for (const m of memberships) {
            if (Array.isArray(m.roles)) {
                for (const r of m.roles) {
                    if (r && r.startsWith('ORG')) {
                        activeOrgRoles.add(r);
                    }
                }
            }
        }

        const baseRoles = (Array.isArray(user.roles) ? user.roles : ['USER'])
            .filter(r => Boolean(r) && !r.startsWith('ORG'));
        if (baseRoles.length === 0) {
            baseRoles.push('USER');
        }

        user.roles = Array.from(new Set([...baseRoles, ...Array.from(activeOrgRoles)]));
        await this.userRepo.save(user);
        return user.roles;
    }

    private async findOrgOrFail(organizacaoId: string): Promise<Organizacao> {
        const org = await this._repo.findOne({
            where: { internalId: Equal(organizacaoId), deleted: IsNull() },
            relations: ['tenant', 'createdBy'],
        });
        if (!org) {
            throw new NotFoundException('Organização não encontrada.');
        }
        return org;
    }

    private async assertCanManageOrg(org: Organizacao, user: User): Promise<void> {
        if (!user?.id) {
            throw new ForbiddenException('Usuário não autenticado.');
        }
        const isCreator = org.ownerUserId === user.id || org.createdBy?.identifiedUser === user.id;
        if (isCreator) return;

        if (user.roles?.includes('MASTER') || user.roles?.includes('ADMIN')) return;

        if (this.membroRepo) {
            const member = await this.membroRepo.findOne({
                where: {
                    organizacaoId: Equal(org.internalId!),
                    userId: Equal(user.id),
                    status: Equal('ACTIVE'),
                    deleted: IsNull(),
                },
            });
            if (member && (member.isOwner || member.roles?.includes('ORG_ADMIN'))) {
                return;
            }
        }

        throw new ForbiddenException('Apenas o criador ou administrador da organização pode gerenciar membros, tenant e roles.');
    }

    private async assertCanViewOrg(org: Organizacao, user: User): Promise<void> {
        if (!user?.id) {
            throw new ForbiddenException('Usuário não autenticado.');
        }
        if (org.ownerUserId === user.id || org.createdBy?.identifiedUser === user.id) return;
        if (user.roles?.includes('MASTER') || user.roles?.includes('ADMIN')) return;

        const userTenantIds = new Set((user.tenants || []).map(t => t.id).filter(Boolean));
        const orgTenantId = org.tenantId || org.tenant?.id;
        if (orgTenantId && userTenantIds.has(orgTenantId)) return;

        if (this.membroRepo) {
            const member = await this.membroRepo.findOne({
                where: {
                    organizacaoId: Equal(org.internalId!),
                    userId: Equal(user.id),
                    status: Equal('ACTIVE'),
                    deleted: IsNull(),
                },
            });
            if (member) return;
        }

        throw new ForbiddenException('Você não possui acesso a esta organização.');
    }

    override async sincronizar(data: Organizacao, request?: any): Promise<Organizacao> {
        const isNew = Boolean(data && !data.internalId);
        const saved = await super.sincronizar(data, request);
        if (isNew && saved?.internalId && !saved.deleted && request?.user?.id) {
            if (!saved.ownerUserId) {
                saved.ownerUserId = request.user.id;
            }
            const tenant = await this.ensureTenantForOrganizacao(saved, request.user);
            await this.ensureDefaultOrgRoles(saved.internalId, request.user.id);
            if (tenant) {
                await this.adicionarTenantAoUsuario(request.user.id, tenant);
            }
            if (this.membroRepo) {
                const existingOwner = await this.membroRepo.findOne({
                    where: { organizacaoId: Equal(saved.internalId), userId: Equal(request.user.id), deleted: IsNull() }
                });
                if (!existingOwner && tenant?.id) {
                    const member = this.membroRepo.create({
                        organizacaoId: saved.internalId,
                        tenantId: tenant.id,
                        userId: request.user.id,
                        userEmail: request.user.email,
                        userName: request.user.fullName || request.user.surname || request.user.username,
                        isOwner: true,
                        roles: ['ORG_ADMIN'],
                        status: 'ACTIVE',
                        invitedByUserId: request.user.id,
                    });
                    await this.membroRepo.save(member);
                    await this.sincronizarOrgRolesNoUsuario(request.user.id);
                }
            }
        }
        return saved;
    }

    async criarOrganizacao(dto: CriarOrganizacaoDto, request: any) {
        const user: User = request?.user;
        if (!user?.id) {
            throw new ForbiddenException('É necessário estar autenticado para criar uma organização.');
        }
        const nome = (dto?.organizatioName || '').trim();
        if (!nome) {
            throw new BadRequestException('O nome da organização é obrigatório.');
        }

        const org = this._repo.create({
            organizatioName: nome,
            description: dto?.description?.trim() || undefined,
            cnpj: dto?.cnpj?.trim() || undefined,
            website: dto?.website?.trim() || undefined,
            ownerUserId: user.id,
            ...(request?.chaveAcesso ? { createdBy: { id: request.chaveAcesso } as any } : {}),
        });
        const savedOrg = await this._repo.save(org);

        const tenant = await this.ensureTenantForOrganizacao(savedOrg, user);
        await this.ensureDefaultOrgRoles(savedOrg.internalId!, user.id);

        if (tenant) {
            await this.adicionarTenantAoUsuario(user.id, tenant);
        }

        if (this.membroRepo && tenant?.id) {
            const ownerMember = this.membroRepo.create({
                organizacaoId: savedOrg.internalId!,
                tenantId: tenant.id,
                userId: user.id,
                userEmail: user.email,
                userName: user.fullName || user.surname || user.username || user.email,
                isOwner: true,
                roles: ['ORG_ADMIN'],
                status: 'ACTIVE',
                invitedByUserId: user.id,
                ...(request?.chaveAcesso ? { createdBy: { id: request.chaveAcesso } as any } : {}),
            });
            await this.membroRepo.save(ownerMember);
            await this.sincronizarOrgRolesNoUsuario(user.id);
        }

        return await this.obterDetalhesOrganizacao(savedOrg.internalId!, request);
    }

    async atualizarOrganizacao(organizacaoId: string, dto: AtualizarOrganizacaoDto, request: any) {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanManageOrg(org, request?.user);

        if (dto?.organizatioName !== undefined) {
            const cleanName = (dto.organizatioName || '').trim();
            if (!cleanName) {
                throw new BadRequestException('O nome da organização não pode ficar vazio.');
            }
            org.organizatioName = cleanName;
            if (org.tenant && this.tenantRepo) {
                org.tenant.name = `ORG: ${cleanName}`;
                await this.tenantRepo.save(org.tenant);
            }
        }
        if (dto?.description !== undefined) {
            org.description = dto.description?.trim() || undefined;
        }
        if (dto?.cnpj !== undefined) {
            org.cnpj = dto.cnpj?.trim() || undefined;
        }
        if (dto?.website !== undefined) {
            org.website = dto.website?.trim() || undefined;
        }
        org.lastModifiedAt = new Date();
        if (request?.chaveAcesso) {
            org.lastModifiedBy = { id: request.chaveAcesso } as any;
        }
        await this._repo.save(org);
        return await this.obterDetalhesOrganizacao(org.internalId!, request);
    }

    async listarMinhasOrganizacoes(request: any) {
        const user: User = request?.user;
        if (!user?.id) {
            return [];
        }

        const memberships = this.membroRepo
            ? await this.membroRepo.find({
                where: {
                    userId: Equal(user.id),
                    status: Equal('ACTIVE'),
                    deleted: IsNull(),
                },
            })
            : [];
        const memberOrgIds = memberships.map(m => m.organizacaoId).filter(Boolean);
        const userTenantIds = (user.tenants || []).map(t => t.id).filter(Boolean) as string[];

        const whereClauses: any[] = [
            { ownerUserId: Equal(user.id), deleted: IsNull() },
            { createdBy: { identifiedUser: Equal(user.id) }, deleted: IsNull() },
        ];
        if (memberOrgIds.length > 0) {
            whereClauses.push({ internalId: In(memberOrgIds), deleted: IsNull() });
        }
        if (userTenantIds.length > 0) {
            whereClauses.push({ tenantId: In(userTenantIds), deleted: IsNull() });
        }

        const orgs = await this._repo.find({
            where: whereClauses,
            relations: ['tenant', 'createdBy'],
            order: { createdAt: 'DESC' },
        });

        const uniqueMap = new Map<string, Organizacao>();
        for (const o of orgs) {
            if (o.internalId) uniqueMap.set(o.internalId, o);
        }
        const uniqueOrgs = Array.from(uniqueMap.values());
        if (uniqueOrgs.length === 0) return [];

        const orgIds = uniqueOrgs.map(o => o.internalId!);
        const allMembers = this.membroRepo
            ? await this.membroRepo.find({
                where: { organizacaoId: In(orgIds), status: Equal('ACTIVE'), deleted: IsNull() },
            })
            : [];
        const allRoles = this.roleRepo
            ? await this.roleRepo.find({
                where: { organizacaoId: In(orgIds), deleted: IsNull() },
            })
            : [];

        return uniqueOrgs.map(org => {
            const orgMembers = allMembers.filter(m => m.organizacaoId === org.internalId);
            const orgRoles = allRoles.filter(r => r.organizacaoId === org.internalId);
            const myMember = orgMembers.find(m => m.userId === user.id);
            const isOwner = org.ownerUserId === user.id || org.createdBy?.identifiedUser === user.id || Boolean(myMember?.isOwner);

            return {
                ...org,
                tenantId: org.tenantId || org.tenant?.id,
                isOwner,
                myRoles: myMember?.roles || (isOwner ? ['ORG_ADMIN'] : []),
                membersCount: orgMembers.length || 1,
                rolesCount: orgRoles.length,
            };
        });
    }

    async obterDetalhesOrganizacao(organizacaoId: string, request: any) {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanViewOrg(org, request?.user);

        const tenant = await this.ensureTenantForOrganizacao(org, request?.user);
        const roles = await this.ensureDefaultOrgRoles(org.internalId!, org.ownerUserId || request?.user?.id);
        const members = await this.listarMembros(org.internalId!, request);
        const myMember = members.find(m => m.userId === request?.user?.id);
        const isOwner = org.ownerUserId === request?.user?.id || org.createdBy?.identifiedUser === request?.user?.id || Boolean(myMember?.isOwner);

        return {
            ...org,
            tenant,
            tenantId: tenant?.id || org.tenantId,
            isOwner,
            myRoles: myMember?.roles || (isOwner ? ['ORG_ADMIN'] : []),
            membersCount: members.length,
            rolesCount: roles.length,
            members,
            orgRoles: roles,
        };
    }

    async buscarUsuarios(search: string, request: any) {
        const currentUserId = request?.user?.id;
        if (!this.userRepo) return [];

        const qb = this.userRepo.createQueryBuilder('u')
            .select(['u.id', 'u.username', 'u.fullName', 'u.surname', 'u.email']);

        if (currentUserId) {
            qb.where('u.id != :currentUserId', { currentUserId });
        }

        if (search && search.trim().length > 0) {
            const term = `%${search.trim().toLowerCase()}%`;
            qb.andWhere(
                '(LOWER(u.username) LIKE :term OR LOWER(u.email) LIKE :term OR LOWER(u.fullName) LIKE :term OR LOWER(u.surname) LIKE :term)',
                { term }
            );
        }

        const users = await qb.orderBy('u.createdAt', 'DESC').take(20).getMany();
        return users.map(u => ({
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            surname: u.surname,
            email: u.email,
        }));
    }

    async listarRoles(organizacaoId: string, request: any): Promise<OrganizacaoRole[]> {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanViewOrg(org, request?.user);
        return await this.ensureDefaultOrgRoles(org.internalId!, org.ownerUserId || request?.user?.id);
    }

    async criarRole(organizacaoId: string, dto: CriarOrganizacaoRoleDto, request: any): Promise<OrganizacaoRole> {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanManageOrg(org, request?.user);
        if (!this.roleRepo) {
            throw new BadRequestException('Repositório de roles da organização indisponível.');
        }

        const { code, customName } = this.normalizeOrgRoleCode(dto?.name);

        const existing = await this.roleRepo.findOne({
            where: {
                organizacaoId: Equal(org.internalId!),
                code: Equal(code),
                deleted: IsNull(),
            },
        });
        if (existing) {
            if (dto?.description !== undefined) {
                existing.description = dto.description?.trim() || existing.description;
                return await this.roleRepo.save(existing);
            }
            return existing;
        }

        const created = this.roleRepo.create({
            organizacaoId: org.internalId!,
            code,
            customName,
            description: dto?.description?.trim() || undefined,
            createdByUserId: request?.user?.id,
            ...(request?.chaveAcesso ? { createdBy: { id: request.chaveAcesso } as any } : {}),
        });
        return await this.roleRepo.save(created);
    }

    async removerRole(organizacaoId: string, roleId: string, request: any): Promise<{ removed: boolean; code?: string }> {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanManageOrg(org, request?.user);
        if (!this.roleRepo) {
            throw new BadRequestException('Repositório de roles indisponível.');
        }

        const role = await this.roleRepo.findOne({
            where: {
                internalId: Equal(roleId),
                organizacaoId: Equal(org.internalId!),
                deleted: IsNull(),
            },
        });
        if (!role) {
            throw new NotFoundException('Role da organização não encontrado.');
        }
        if (role.code === 'ORG_ADMIN') {
            throw new BadRequestException('O role padrão ORG_ADMIN não pode ser removido.');
        }

        role.deleted = true;
        await this.roleRepo.save(role);

        if (this.membroRepo) {
            const members = await this.membroRepo.find({
                where: {
                    organizacaoId: Equal(org.internalId!),
                    status: Equal('ACTIVE'),
                    deleted: IsNull(),
                },
            });
            for (const member of members) {
                if (member.roles?.includes(role.code)) {
                    member.roles = member.roles.filter(r => r !== role.code);
                    await this.membroRepo.save(member);
                    await this.sincronizarOrgRolesNoUsuario(member.userId);
                }
            }
        }

        return { removed: true, code: role.code };
    }

    async listarMembros(organizacaoId: string, request: any): Promise<OrganizacaoMembro[]> {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanViewOrg(org, request?.user);
        if (!this.membroRepo) return [];

        return await this.membroRepo.find({
            where: {
                organizacaoId: Equal(org.internalId!),
                status: Equal('ACTIVE'),
                deleted: IsNull(),
            },
            order: { isOwner: 'DESC', createdAt: 'ASC' },
        });
    }

    async compartilharComUsuario(
        organizacaoId: string,
        dto: CompartilharOrganizacaoDto,
        request: any,
    ): Promise<OrganizacaoMembro> {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanManageOrg(org, request?.user);

        if (!this.userRepo || !this.membroRepo) {
            throw new BadRequestException('Serviço de compartilhamento indisponível.');
        }

        let targetUser: User | null = null;
        if (dto?.userId?.trim()) {
            targetUser = await this.userRepo.findOne({
                where: { id: Equal(dto.userId.trim()) },
                relations: ['tenants'],
            });
        } else if (dto?.emailOrUsername?.trim()) {
            const term = dto.emailOrUsername.trim().toLowerCase();
            targetUser = await this.userRepo
                .createQueryBuilder('u')
                .leftJoinAndSelect('u.tenants', 'tenants')
                .where('LOWER(u.email) = :term OR LOWER(u.username) = :term', { term })
                .getOne();
        } else {
            throw new BadRequestException('Informe o usuário (userId, e-mail ou username) para compartilhar.');
        }

        if (!targetUser?.id) {
            throw new NotFoundException('Usuário destino não encontrado na plataforma.');
        }

        const tenant = await this.ensureTenantForOrganizacao(org, request?.user);
        if (!tenant?.id) {
            throw new BadRequestException('Não foi possível resolver o Tenant da organização.');
        }

        await this.ensureDefaultOrgRoles(org.internalId!, org.ownerUserId || request?.user?.id);

        const rawRoles = Array.isArray(dto?.roles) && dto.roles.length > 0 ? dto.roles : ['ORG_MEMBRO'];
        const normalizedCodes: string[] = [];
        for (const rawRole of rawRoles) {
            const { code, customName } = this.normalizeOrgRoleCode(rawRole);
            if (!normalizedCodes.includes(code)) {
                normalizedCodes.push(code);
            }
            if (this.roleRepo) {
                const roleExists = await this.roleRepo.findOne({
                    where: { organizacaoId: Equal(org.internalId!), code: Equal(code), deleted: IsNull() },
                });
                if (!roleExists) {
                    await this.roleRepo.save(
                        this.roleRepo.create({
                            organizacaoId: org.internalId!,
                            code,
                            customName,
                            createdByUserId: request?.user?.id,
                        })
                    );
                }
            }
        }

        // Vincula o Tenant da organização ao usuário destino
        await this.adicionarTenantAoUsuario(targetUser.id, tenant);

        let member = await this.membroRepo.findOne({
            where: {
                organizacaoId: Equal(org.internalId!),
                userId: Equal(targetUser.id),
                deleted: IsNull(),
            },
        });

        if (member) {
            member.status = 'ACTIVE';
            member.tenantId = tenant.id;
            member.userEmail = targetUser.email || member.userEmail;
            member.userName = targetUser.fullName || targetUser.surname || targetUser.username || targetUser.email;
            member.roles = Array.from(new Set([...(member.roles || []), ...normalizedCodes]));
            member.invitedByUserId = request?.user?.id;
        } else {
            member = this.membroRepo.create({
                organizacaoId: org.internalId!,
                tenantId: tenant.id,
                userId: targetUser.id,
                userEmail: targetUser.email,
                userName: targetUser.fullName || targetUser.surname || targetUser.username || targetUser.email,
                isOwner: targetUser.id === org.ownerUserId,
                roles: normalizedCodes,
                status: 'ACTIVE',
                invitedByUserId: request?.user?.id,
                ...(request?.chaveAcesso ? { createdBy: { id: request.chaveAcesso } as any } : {}),
            });
        }

        const savedMember = await this.membroRepo.save(member);
        await this.sincronizarOrgRolesNoUsuario(targetUser.id);
        return savedMember;
    }

    async atribuirRolesMembro(
        organizacaoId: string,
        memberId: string,
        rawRoles: string[],
        request: any,
    ): Promise<OrganizacaoMembro> {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanManageOrg(org, request?.user);

        if (!this.membroRepo) {
            throw new BadRequestException('Repositório de membros indisponível.');
        }

        const member = await this.membroRepo.findOne({
            where: {
                internalId: Equal(memberId),
                organizacaoId: Equal(org.internalId!),
                deleted: IsNull(),
            },
        });
        if (!member) {
            throw new NotFoundException('Membro não encontrado nesta organização.');
        }

        const normalizedCodes: string[] = [];
        for (const rawRole of rawRoles || []) {
            if (!rawRole || !rawRole.trim()) continue;
            const { code, customName } = this.normalizeOrgRoleCode(rawRole);
            if (!normalizedCodes.includes(code)) {
                normalizedCodes.push(code);
            }
            if (this.roleRepo) {
                const exists = await this.roleRepo.findOne({
                    where: { organizacaoId: Equal(org.internalId!), code: Equal(code), deleted: IsNull() },
                });
                if (!exists) {
                    await this.roleRepo.save(
                        this.roleRepo.create({
                            organizacaoId: org.internalId!,
                            code,
                            customName,
                            createdByUserId: request?.user?.id,
                        })
                    );
                }
            }
        }

        if (member.isOwner && !normalizedCodes.includes('ORG_ADMIN')) {
            normalizedCodes.unshift('ORG_ADMIN');
        }

        member.roles = normalizedCodes;
        const saved = await this.membroRepo.save(member);
        await this.sincronizarOrgRolesNoUsuario(member.userId);
        return saved;
    }

    async removerMembro(organizacaoId: string, memberId: string, request: any): Promise<{ removed: boolean }> {
        const org = await this.findOrgOrFail(organizacaoId);
        await this.assertCanManageOrg(org, request?.user);

        if (!this.membroRepo) {
            throw new BadRequestException('Repositório de membros indisponível.');
        }

        const member = await this.membroRepo.findOne({
            where: {
                internalId: Equal(memberId),
                organizacaoId: Equal(org.internalId!),
                deleted: IsNull(),
            },
        });
        if (!member) {
            throw new NotFoundException('Membro não encontrado nesta organização.');
        }
        if (member.isOwner || member.userId === org.ownerUserId) {
            throw new BadRequestException('O usuário criador da organização não pode ser removido.');
        }

        member.status = 'REMOVED';
        member.roles = [];
        member.deleted = true;
        await this.membroRepo.save(member);

        await this.removerTenantDoUsuario(member.userId, org.tenantId || org.tenant?.id);
        await this.sincronizarOrgRolesNoUsuario(member.userId);
        return { removed: true };
    }
}
