import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Application } from "../model/application.entity";
import { ClientVersionCatalog } from "../model/client-version-catalog.entity";
import { Repository } from "typeorm";
import { CatalogAppDto, ReconcileCatalogDto, ToggleUserActivationDto, ToggleGlobalAppDto, InstallGitModuleDto } from "../dto/catalog-app.dto";
import { User } from "@ci/auth/models/user.entity";
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    async canLoad(appKey: string, user?: User, tenantId?: string): Promise<{ canLoad: boolean; reason?: string; app?: Application; requiresActivation?: boolean }> {
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

        if (app.contextPolicies?.requiresActivation && user?.id) {
            const userApps = await this.repo.createQueryBuilder('app')
                .innerJoin('app.users', 'user', 'user.id = :userId', { userId: user.id })
                .where('app.id = :appId', { appId: app.id })
                .getCount();
            if (userApps === 0 && !user.roles?.includes('ADMIN') && !user.roles?.includes('MASTER')) {
                return { canLoad: false, reason: 'Esta aplicação precisa ser ativada na Loja antes de ser utilizada.', app, requiresActivation: true };
            }
        }

        return { canLoad: true, app };
    }

    /**
     * Verifica se o usuário é colaborador da aplicação com base no seu e-mail.
     */
    isCollaborator(app: Application, user?: User): boolean {
        if (!user || !user.email || !app.collaborators || app.collaborators.length === 0) {
            return false;
        }
        const userEmail = user.email.toLowerCase().trim();
        return app.collaborators.some(collab => {
            const c = collab.toLowerCase();
            return c.includes(`<${userEmail}>`) || c.includes(userEmail);
        });
    }

    /**
     * Obtém as aplicações disponíveis na Loja para o usuário,
     * incluindo o status de ativação na conta (isActivated),
     * permissão de ativação (canActivate) e controles globais para MASTER+DEVELOPER.
     */
    async getStore(user?: User, search?: string, categoria?: string) {
        const isMaster = user?.roles?.includes('MASTER');
        const isDeveloper = user?.roles?.includes('DEVELOPER');
        const isGoodness = user?.roles?.includes('GOODNESS');

        const query = this.repo.createQueryBuilder('app')
            .leftJoinAndSelect('app.domain', 'domain');

        // Usuários comuns só vêem aplicações ativas globalmente;
        // Colaboradores e GOODNESS vêem tudo para poderem ativar ou gerenciar globalmente
        if (!isGoodness && !isMaster) {
            query.where('(app.isActive = true OR app.isActive IS NULL)');
        }

        if (search && search.trim()) {
            query.andWhere('(LOWER(app.name) LIKE LOWER(:search) OR LOWER(app.description) LIKE LOWER(:search) OR LOWER(app.appKey) LIKE LOWER(:search))', { search: `%${search.trim()}%` });
        }

        if (categoria && categoria !== 'all' && categoria !== 'Todas') {
            query.andWhere('app.categoria = :categoria', { categoria });
        }

        query.orderBy('app.name', 'ASC');

        const apps = await query.getMany();

        let userAppIds = new Set<string>();
        if (user?.id) {
            // Consulta aplicações vinculadas a este usuário
            const userApps = await this.repo.createQueryBuilder('app')
                .innerJoin('app.users', 'user', 'user.id = :userId', { userId: user.id })
                .select('app.id')
                .getMany();
            userAppIds = new Set(userApps.map(a => a.id).filter(Boolean) as string[]);
        }

        return apps.map(app => {
            const isActivated = userAppIds.has(app.id!);
            const isCollab = this.isCollaborator(app, user);
            const canToggleGlobal = Boolean(isMaster && isDeveloper && isCollab);

            let canActivate = false;
            let roleRestricted = false;

            if (isGoodness) {
                // ROLE GOODNESS permite ativar todas as applications independente
                canActivate = true;
            } else if (isCollab) {
                // Para os colaboradores, sempre deve ficar disponível para ativação
                canActivate = true;
            } else if (app.isActive === false) {
                canActivate = false;
            } else if (app.roles && app.roles.length > 0) {
                // Aplicações que exigem ROLE específica não podem ficar disponíveis para ativação sem o papel
                const hasRole = app.roles.some(r => user?.roles?.includes(r));
                canActivate = hasRole;
                roleRestricted = !hasRole;
            } else {
                canActivate = true;
            }

            return {
                ...app,
                isActivated,
                isCollaborator: isCollab,
                canToggleGlobal,
                canActivate,
                roleRestricted
            };
        });
    }

    /**
     * Alterna ou define a ativação de uma aplicação para a conta do usuário.
     * Respeita papéis específicos, permissão especial de GOODNESS e privilégio de colaboradores.
     */
    async toggleUserActivation(dto: ToggleUserActivationDto, user: User) {
        if (!user || !user.id) {
            throw new ForbiddenException('Usuário não autenticado.');
        }

        const app = await this.repo.findOne({
            where: [
                ...(dto.applicationId ? [{ id: dto.applicationId }] : []),
                ...(dto.appKey ? [{ appKey: dto.appKey }, { routePath: `/${dto.appKey}` }] : [])
            ],
            relations: ['users']
        });

        if (!app) {
            throw new NotFoundException('Aplicação não encontrada.');
        }

        const isCurrentlyActive = (app.users || []).some(u => u.id === user.id);
        const shouldBeActive = dto.active !== undefined ? dto.active : !isCurrentlyActive;

        if (shouldBeActive) {
            const isGoodness = user.roles?.includes('GOODNESS');
            const isCollab = this.isCollaborator(app, user);

            if (!isGoodness && !isCollab) {
                if (app.isActive === false) {
                    throw new ForbiddenException('Esta aplicação está temporariamente desativada globalmente.');
                }
                if (app.roles && app.roles.length > 0) {
                    const hasRole = app.roles.some(r => user.roles?.includes(r));
                    if (!hasRole) {
                        throw new ForbiddenException(`Esta aplicação exige papel específico (${app.roles.join(', ')}) para ativação.`);
                    }
                }
            }
        }

        if (shouldBeActive && !isCurrentlyActive) {
            await this.repo.createQueryBuilder()
                .relation(Application, 'users')
                .of(app)
                .add(user);
        } else if (!shouldBeActive && isCurrentlyActive) {
            await this.repo.createQueryBuilder()
                .relation(Application, 'users')
                .of(app)
                .remove(user);
        }

        return {
            success: true,
            appKey: app.appKey,
            applicationId: app.id,
            isActivated: shouldBeActive,
            firstActivation: shouldBeActive && !isCurrentlyActive
        };
    }

    /**
     * Usuários MASTER + DEVELOPER que pertençam aos colaboradores da aplicação
     * podem desativar ou ativar seus aplicativos globalmente para que outros usuários ativem.
     */
    async toggleGlobalStatus(dto: ToggleGlobalAppDto, user: User) {
        if (!user || !user.id) {
            throw new ForbiddenException('Usuário não autenticado.');
        }

        const isMaster = user.roles?.includes('MASTER');
        const isDeveloper = user.roles?.includes('DEVELOPER');
        if (!isMaster || !isDeveloper) {
            throw new ForbiddenException('Apenas usuários com papéis MASTER e DEVELOPER podem gerenciar o status global de aplicações.');
        }

        const app = await this.repo.findOne({
            where: [
                ...(dto.applicationId ? [{ id: dto.applicationId }] : []),
                ...(dto.appKey ? [{ appKey: dto.appKey }, { routePath: `/${dto.appKey}` }] : [])
            ]
        });

        if (!app) {
            throw new NotFoundException('Aplicação não encontrada.');
        }

        if (!this.isCollaborator(app, user)) {
            throw new ForbiddenException('Apenas colaboradores cadastrados desta aplicação podem ativar/desativar seu status global.');
        }

        const targetGlobalActive = dto.active !== undefined ? dto.active : !app.isActive;
        app.isActive = targetGlobalActive;
        app.lastSeenAt = new Date();
        await this.repo.save(app);

        return {
            success: true,
            appKey: app.appKey,
            applicationId: app.id,
            isActive: app.isActive
        };
    }

    /**
     * Retorna a lista de chaves de aplicações ativadas para o usuário logado.
     */
    async getUserActivations(user: User): Promise<string[]> {
        if (!user || !user.id) return [];
        const apps = await this.repo.createQueryBuilder('app')
            .innerJoin('app.users', 'user', 'user.id = :userId', { userId: user.id })
            .select(['app.appKey', 'app.routePath'])
            .getMany();

        return apps.map(a => a.appKey || a.routePath?.replace(/^\//, '')).filter(Boolean) as string[];
    }

    /**
     * Adiciona e instala uma aplicação/lib NestJS a partir de um repositório Git isolado.
     * Restrito a usuários com ROLE DEVELOPER.
     * Clona em pasta isolada com git próprio (sem merge no projeto principal)
     * e compila em processo paralelo.
     */
    async installGitModule(dto: InstallGitModuleDto, user: User) {
        if (!user || !user.id) {
            throw new ForbiddenException('Usuário não autenticado.');
        }

        const isDeveloper = user.roles?.includes('DEVELOPER');
        const isMaster = user.roles?.includes('MASTER');
        const isGoodness = user.roles?.includes('GOODNESS');

        if (!isDeveloper && !isMaster && !isGoodness) {
            throw new ForbiddenException('Apenas usuários com ROLE DEVELOPER podem adicionar aplicações via repositório Git.');
        }

        if (!dto.gitUrl || !dto.moduleName || !dto.appKey) {
            throw new BadRequestException('Endereço Git (gitUrl), nome do módulo (moduleName) e appKey são obrigatórios.');
        }

        const appKey = dto.appKey.trim();
        const safeFolderName = appKey.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const baseExternalDir = path.resolve(process.cwd(), 'external-modules');
        const targetDir = path.join(baseExternalDir, safeFolderName);

        // Garante que o diretório base existe
        if (!fs.existsSync(baseExternalDir)) {
            fs.mkdirSync(baseExternalDir, { recursive: true });
        }

        const branch = dto.branch || 'main';

        try {
            if (!fs.existsSync(targetDir)) {
                // Clona em pasta isolada com git próprio (sem mesclar no projeto principal)
                await execAsync(`git clone -b ${branch} --depth 1 "${dto.gitUrl}" "${targetDir}"`);
            } else {
                // Atualiza repositório isolado existente
                try {
                    await execAsync(`git -C "${targetDir}" pull`);
                } catch {
                    // Se falhar o pull, mantém a versão local existente
                }
            }
        } catch (gitErr: any) {
            throw new BadRequestException(`Falha ao clonar repositório Git: ${gitErr?.message || gitErr}`);
        }

        // Compilação paralela assíncrona em background (sem bloquear a plataforma principal)
        const compileParallel = () => {
            const hasPackageJson = fs.existsSync(path.join(targetDir, 'package.json'));
            if (hasPackageJson) {
                const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
                const installProc = spawn(npmCmd, ['install', '--prefer-offline', '--no-audit'], {
                    cwd: targetDir,
                    stdio: 'ignore',
                    detached: true,
                    shell: true
                });

                installProc.on('close', (code) => {
                    if (code === 0) {
                        const buildProc = spawn(npmCmd, ['run', 'build'], {
                            cwd: targetDir,
                            stdio: 'ignore',
                            detached: true,
                            shell: true
                        });
                        buildProc.unref();
                    }
                });
                installProc.unref();
            }
        };

        try {
            compileParallel();
        } catch (compileErr) {
            console.warn('[ApplicationService] Falha ao disparar compilação paralela:', compileErr);
        }

        // Registra ou atualiza no catálogo de aplicações
        const routePath = dto.routePath || `/${appKey}`;
        let app = await this.repo.findOne({
            where: [
                { appKey },
                { routePath }
            ],
            relations: ['users']
        });

        const now = new Date();
        const collaboratorTag = user.email ? `${user.username || 'dev'} <${user.email}>` : (user.username || user.id);

        if (!app) {
            app = this.repo.create({
                appKey,
                name: dto.name || appKey,
                routePath,
                icon: dto.icon || 'developer_board',
                categoria: 'Desenvolvedor',
                description: dto.description || `Módulo NestJS "${dto.moduleName}" instalado via Git isolado.`,
                roles: ['DEVELOPER'],
                isActive: true,
                isCatalogLocked: false,
                collaborators: [collaboratorTag],
                contextPolicies: {
                    isExternalModule: true,
                    moduleName: dto.moduleName,
                    gitUrl: dto.gitUrl,
                    branch,
                    targetDir,
                    configurations: dto.configurations || {},
                    installedBy: user.id,
                    installedAt: now
                },
                firstSeenAt: now,
                lastSeenAt: now
            });
            app = await this.repo.save(app);
        } else {
            app.lastSeenAt = now;
            app.isActive = true;
            if (dto.name) app.name = dto.name;
            if (dto.description) app.description = dto.description;
            if (dto.icon) app.icon = dto.icon;
            app.contextPolicies = {
                ...(app.contextPolicies || {}),
                isExternalModule: true,
                moduleName: dto.moduleName,
                gitUrl: dto.gitUrl,
                branch,
                targetDir,
                configurations: dto.configurations || {},
                updatedBy: user.id,
                updatedAt: now
            };
            if (!app.collaborators || !app.collaborators.includes(collaboratorTag)) {
                app.collaborators = [...(app.collaborators || []), collaboratorTag];
            }
            app = await this.repo.save(app);
        }

        // Ativa automaticamente a aplicação para este desenvolvedor
        const isAlreadyActiveForUser = (app.users || []).some(u => u.id === user.id);
        if (!isAlreadyActiveForUser) {
            await this.repo.createQueryBuilder()
                .relation(Application, 'users')
                .of(app)
                .add(user);
        }

        return {
            success: true,
            appKey: app.appKey,
            applicationId: app.id,
            name: app.name,
            routePath: app.routePath,
            targetDir,
            isActivated: true,
            message: `Módulo NestJS "${dto.moduleName}" clonado em pasta isolada e compilação paralela iniciada.`
        };
    }

    async delete(applicationId: string) {
        return this.repo.delete(applicationId);
    }
}
