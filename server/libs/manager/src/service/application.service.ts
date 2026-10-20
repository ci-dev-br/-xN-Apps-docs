import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Application } from "../model/application.entity";
import { ClientVersionCatalog } from "../model/client-version-catalog.entity";
import { Repository } from "typeorm";
import { CatalogAppDto, ReconcileCatalogDto } from "../dto/catalog-app.dto";
import { User } from "@ci/auth/models/user.entity";

@Injectable()
export class ApplicationService {
    constructor(
        @InjectRepository(Application)
        private readonly repo: Repository<Application>,
        @InjectRepository(ClientVersionCatalog)
        private readonly versionRepo: Repository<ClientVersionCatalog>,
    ) { }

    async find(roles?: string[], tenantId?: string, includeInactive = false) {
        const query = this.repo.createQueryBuilder('app')
            .leftJoinAndSelect('app.domain', 'domain')
            .orderBy('app.name', 'ASC');

        if (!includeInactive) {
            query.andWhere('(app.isActive = true OR app.isActive IS NULL)');
        }

        if (roles && roles.length > 0) {
            query.andWhere('(app.roles && :roles OR app.roles IS NULL)', { roles });
        }

        if (tenantId) {
            query.andWhere('(app.allowedTenantIds IS NULL OR :tenantId = ANY(app.allowedTenantIds))', { tenantId });
        }

        return await query.getMany();
    }

    /**
     * Verifica se uma versão específica do cliente já foi catalogada e reconciliada.
     */
    async isVersionCataloged(versionHash: string): Promise<{ isCataloged: boolean; catalog?: ClientVersionCatalog }> {
        if (!versionHash) return { isCataloged: false };
        const catalog = await this.versionRepo.findOneBy({ versionHash });
        return {
            isCataloged: !!catalog,
            catalog: catalog || undefined
        };
    }

    /**
     * Reconciliação completa do catálogo a partir da versão do cliente:
     * - Cadastra novas aplicações
     * - Atualiza aplicações existentes com metadados (hash da versão, colaboradores)
     * - Desativa aplicações removidas do código do cliente
     * - Restrito a usuários com papel MASTER.
     */
    async reconcileCatalog(dto: ReconcileCatalogDto, user: User) {
        if (!user?.roles?.includes('MASTER')) {
            throw new ForbiddenException('Apenas usuários com papel MASTER podem realizar a reconciliação e catalogação.');
        }

        const now = new Date();
        const incomingApps = dto.apps || [];
        const incomingKeys = new Set(incomingApps.map(a => a.appKey || a.routePath?.replace(/^\//, '')).filter(Boolean));

        let added = 0;
        let updated = 0;
        let deactivated = 0;

        // 1. Processa cada aplicação informada pelo cliente
        for (const appDto of incomingApps) {
            const appKey = appDto.appKey || appDto.routePath?.replace(/^\//, '');
            const routePath = appDto.routePath || `/${appKey}`;
            if (!appKey) continue;
            incomingKeys.add(appKey);

            const searchConditions: any[] = [
                { appKey },
                { routePath }
            ];
            if (appDto.name) {
                searchConditions.push({ name: appDto.name });
            }
            if (routePath) {
                searchConditions.push({ url: routePath });
            }

            let existing = await this.repo.findOne({
                where: searchConditions
            });

            if (!existing) {
                // Nova aplicação catalogada
                existing = this.repo.create({
                    appKey,
                    routePath,
                    name: appDto.name || appKey,
                    description: appDto.description,
                    icon: appDto.icon,
                    categoria: appDto.categoria || 'System',
                    roles: appDto.roles || ['USER'],
                    gitVersionHash: dto.versionHash,
                    collaborators: dto.collaborators || appDto.collaborators,
                    isActive: true,
                    isCatalogLocked: false,
                    firstSeenAt: now,
                    lastSeenAt: now,
                });
                await this.repo.save(existing);
                added++;
            } else {
                // Aplicação existente: atualiza e garante isActive: true
                existing.isActive = true;
                existing.lastSeenAt = now;
                existing.gitVersionHash = dto.versionHash;
                if (dto.collaborators && dto.collaborators.length > 0) {
                    existing.collaborators = dto.collaborators;
                } else if (appDto.collaborators && appDto.collaborators.length > 0) {
                    existing.collaborators = appDto.collaborators;
                }
                if (!existing.appKey) existing.appKey = appKey;
                if (!existing.routePath) existing.routePath = routePath;

                if (!existing.isCatalogLocked) {
                    if (appDto.name) existing.name = appDto.name;
                    if (appDto.description) existing.description = appDto.description;
                    if (appDto.icon) existing.icon = appDto.icon;
                    if (appDto.categoria) existing.categoria = appDto.categoria;
                    if (appDto.roles && appDto.roles.length > 0) existing.roles = appDto.roles;
                }
                await this.repo.save(existing);
                updated++;
            }
        }

        // 2. Confronta e desativa aplicações que não estão mais presentes no código do cliente
        const allActiveApps = await this.repo.find({
            where: {
                isActive: true
            }
        });

        for (const dbApp of allActiveApps) {
            const key = dbApp.appKey || dbApp.routePath?.replace(/^\//, '');
            if (key && !incomingKeys.has(key)) {
                dbApp.isActive = false;
                dbApp.lastSeenAt = now;
                const policies = dbApp.contextPolicies || {};
                dbApp.contextPolicies = {
                    ...policies,
                    deactivatedAtVersion: dto.versionHash,
                    deactivatedReason: 'Removida das rotas/hardcode do cliente'
                };
                await this.repo.save(dbApp);
                deactivated++;
            }
        }

        // 3. Registra a versão catalogada para não necessitar nova execução na mesma versão
        let versionRecord = await this.versionRepo.findOneBy({ versionHash: dto.versionHash });
        if (!versionRecord) {
            versionRecord = this.versionRepo.create({
                versionHash: dto.versionHash,
                branch: dto.branch,
                collaborators: dto.collaborators,
                catalogedAt: now,
                catalogedBy: user.username || (user as any).fullName || user.id,
                appCount: incomingApps.length
            });
        } else {
            versionRecord.catalogedAt = now;
            versionRecord.collaborators = dto.collaborators;
            versionRecord.catalogedBy = user.username || (user as any).fullName || user.id;
            versionRecord.appCount = incomingApps.length;
        }
        await this.versionRepo.save(versionRecord);

        return {
            success: true,
            versionHash: dto.versionHash,
            added,
            updated,
            deactivated,
            totalActive: incomingApps.length
        };
    }

    /**
     * Catalogação automática pontual na execução da aplicação.
     */
    async catalog(dto: CatalogAppDto): Promise<Application> {
        if (!dto.appKey && !dto.routePath) {
            throw new BadRequestException('A catalogação exige appKey ou routePath vinculado à rota do cliente.');
        }

        const appKey = dto.appKey || dto.routePath?.replace(/^\//, '');
        const routePath = dto.routePath || `/${appKey}`;

        let app = await this.repo.findOne({
            where: [
                { appKey },
                { routePath }
            ]
        });

        const now = new Date();

        if (!app) {
            app = this.repo.create({
                appKey,
                routePath,
                name: dto.name || appKey,
                description: dto.description,
                icon: dto.icon,
                categoria: dto.categoria || 'System',
                roles: dto.roles || ['USER'],
                gitVersionHash: dto.gitVersionHash,
                collaborators: dto.collaborators,
                isActive: true,
                isCatalogLocked: false,
                contextPolicies: dto.contextPolicies,
                firstSeenAt: now,
                lastSeenAt: now,
            });
            return await this.repo.save(app);
        } else {
            app.lastSeenAt = now;
            if (dto.gitVersionHash) {
                app.gitVersionHash = dto.gitVersionHash;
            }
            if (dto.collaborators && dto.collaborators.length > 0) {
                app.collaborators = dto.collaborators;
            }
            if (!app.appKey) {
                app.appKey = appKey;
            }
            if (!app.routePath) {
                app.routePath = routePath;
            }

            if (!app.isCatalogLocked) {
                if (dto.name && !app.name) app.name = dto.name;
                if (dto.description && !app.description) app.description = dto.description;
                if (dto.icon && !app.icon) app.icon = dto.icon;
                if (dto.categoria && !app.categoria) app.categoria = dto.categoria;
                if (dto.roles && (!app.roles || app.roles.length === 0)) app.roles = dto.roles;
                if (dto.contextPolicies && !app.contextPolicies) app.contextPolicies = dto.contextPolicies;
            }

            return await this.repo.save(app);
        }
    }

    /**
     * Sincronização / Edição administrativa da aplicação.
     * Regra estrita: Uma application não pode ser criada diretamente no banco sem vínculo com as rotas do cliente.
     */
    async sync(application: Application, req?: Request) {
        let { id, ...changes } = application;

        if (!id || id.trim().length === 0) {
            if (!application.appKey && !application.routePath) {
                throw new BadRequestException(
                    'Uma aplicação não pode ser criada diretamente no banco sem possuir um appKey/routePath vinculado às rotas do cliente.'
                );
            }
            const existing = await this.repo.findOne({
                where: [
                    { appKey: application.appKey },
                    { routePath: application.routePath }
                ]
            });
            if (existing) {
                Object.assign(existing, changes);
                return await this.repo.save(existing);
            }
            const ref = this.repo.create(application);
            ref.firstSeenAt = ref.firstSeenAt || new Date();
            ref.lastSeenAt = ref.lastSeenAt || new Date();
            return await this.repo.save(ref);
        }

        const ref = await this.repo.findOneBy({ id });
        if (!ref) {
            throw new NotFoundException(`Aplicação com ID ${id} não encontrada.`);
        }
        Object.assign(ref, changes);
        return await this.repo.save(ref);
    }

    /**
     * Registra a assinatura da requisição com a aplicação de origem e hash do git.
     */
    async recordSignature(appKey: string, gitHash?: string) {
        if (!appKey) return;
        try {
            await this.repo.createQueryBuilder()
                .update(Application)
                .set({
                    lastSeenAt: new Date(),
                    ...(gitHash ? { gitVersionHash: gitHash } : {})
                })
                .where('appKey = :appKey OR routePath = :routePath', { appKey, routePath: `/${appKey}` })
                .execute();
        } catch (err) {
            // Silencia erro de telemetria
        }
    }

    /**
     * Avalia se a aplicação pode ser carregada no contexto atual do usuário / tenant.
     */
    async canLoad(appKey: string, user?: User, tenantId?: string): Promise<{ canLoad: boolean; reason?: string; app?: Application }> {
        const app = await this.repo.findOne({
            where: [
                { appKey },
                { routePath: `/${appKey}` }
            ]
        });

        if (!app) {
            return { canLoad: true, reason: 'Aplicação ainda não catalogada no backend' };
        }

        if (app.isActive === false) {
            return { canLoad: false, reason: 'Esta aplicação foi desativada pela administração.', app };
        }

        if (app.allowedTenantIds && app.allowedTenantIds.length > 0) {
            if (!tenantId || !app.allowedTenantIds.includes(tenantId)) {
                return { canLoad: false, reason: 'Esta aplicação não está autorizada para a organização/tenant atual.', app };
            }
        }

        if (app.roles && app.roles.length > 0 && user) {
            const hasRole = app.roles.some(r => user.roles?.includes(r));
            if (!hasRole && !user.roles?.includes('ADMIN') && !user.roles?.includes('MASTER')) {
                return { canLoad: false, reason: 'Usuário não possui os papéis necessários para carregar esta aplicação.', app };
            }
        }

        return { canLoad: true, app };
    }

    async delete(applicationId: string) {
        return this.repo.delete(applicationId);
    }
}
