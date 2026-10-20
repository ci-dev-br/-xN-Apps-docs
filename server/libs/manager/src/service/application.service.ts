import { BadRequestException, ForbiddenException, Injectable, NotFoundException, forwardRef, Inject, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Application } from "../model/application.entity";
import { ClientVersionCatalog } from "../model/client-version-catalog.entity";
import { ApplicationConsumption } from "../model/application-consumption.entity";
import { DeveloperGratitude } from "../model/developer-gratitude.entity";
import { DeveloperGratitudeConfig } from "../model/developer-gratitude-config.entity";
import { Repository } from "typeorm";
import { CatalogAppDto, ReconcileCatalogDto, ToggleUserActivationDto, ToggleGlobalAppDto, InstallGitModuleDto, DeveloperGratitudeConfigDto } from "../dto/catalog-app.dto";
import { User } from "@ci/auth/models/user.entity";
import { CarteiraService } from "@ci/financeiro/service/carteira.service";
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
        @InjectRepository(ApplicationConsumption)
        private readonly consumptionRepo: Repository<ApplicationConsumption>,
        @InjectRepository(DeveloperGratitude)
        private readonly gratitudeRepo: Repository<DeveloperGratitude>,
        @InjectRepository(DeveloperGratitudeConfig)
        private readonly gratitudeConfigRepo: Repository<DeveloperGratitudeConfig>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @Optional() @Inject(forwardRef(() => CarteiraService))
        private readonly carteiraService?: CarteiraService,
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
                    gitVersionHash: appDto.gitVersionHash || dto.versionHash,
                    collaborators: appDto.collaborators || dto.collaborators,
                    folderPath: appDto.folderPath,
                    authors: appDto.authors,
                    coAuthors: appDto.coAuthors,
                    commitCount: appDto.commitCount || 0,
                    lastCommitDate: appDto.lastCommitDate ? new Date(appDto.lastCommitDate) : undefined,
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
                existing.gitVersionHash = appDto.gitVersionHash || dto.versionHash;
                if (appDto.collaborators && appDto.collaborators.length > 0) {
                    existing.collaborators = appDto.collaborators;
                } else if (dto.collaborators && dto.collaborators.length > 0) {
                    existing.collaborators = dto.collaborators;
                }
                if (appDto.folderPath) existing.folderPath = appDto.folderPath;
                if (appDto.authors && appDto.authors.length > 0) existing.authors = appDto.authors;
                if (appDto.coAuthors && appDto.coAuthors.length > 0) existing.coAuthors = appDto.coAuthors;
                if (appDto.commitCount !== undefined) existing.commitCount = appDto.commitCount;
                if (appDto.lastCommitDate) existing.lastCommitDate = new Date(appDto.lastCommitDate);

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
                folderPath: dto.folderPath,
                authors: dto.authors,
                coAuthors: dto.coAuthors,
                commitCount: dto.commitCount || 0,
                lastCommitDate: dto.lastCommitDate ? new Date(dto.lastCommitDate) : undefined,
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
            if (dto.folderPath) app.folderPath = dto.folderPath;
            if (dto.authors && dto.authors.length > 0) app.authors = dto.authors;
            if (dto.coAuthors && dto.coAuthors.length > 0) app.coAuthors = dto.coAuthors;
            if (dto.commitCount !== undefined) app.commitCount = dto.commitCount;
            if (dto.lastCommitDate) app.lastCommitDate = new Date(dto.lastCommitDate);
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
     * Computa o consumo e credita gratidão para os autores.
     */
    async recordSignature(appKey: string, gitHash?: string, user?: User, tenantId?: string) {
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

            // Tombamento em banco do consumo e crédito de gratidão aos autores
            await this.recordConsumption(appKey, user, gitHash, tenantId);
        } catch (err) {
            // Silencia erro de telemetria
        }
    }

    /**
     * Registra o consumo de uma aplicação quando ela é utilizada.
     * Gera o registro de ApplicationConsumption e credita 1 crédito de gratidão
     * para cada autor e co-autor cadastrado nos metadados de Git da pasta da aplicação.
     * Caso o desenvolvedor tenha configurado autoConvert, converte imediatamente para saldo na carteira.
     */
    async recordConsumption(
        appKey: string,
        user?: User,
        gitHash?: string,
        tenantId?: string,
        metadata?: Record<string, any>
    ) {
        if (!appKey) return null;

        const cleanKey = appKey.replace(/^\//, '').trim();
        const app = await this.repo.findOne({
            where: [
                { appKey: cleanKey },
                { routePath: `/${cleanKey}` },
                { name: cleanKey }
            ]
        });

        const now = new Date();
        const consumption = this.consumptionRepo.create({
            appKey: cleanKey,
            applicationId: app?.id,
            userId: user?.id,
            tenantId,
            gitVersionHash: gitHash || app?.gitVersionHash,
            metadata: metadata || {},
            gratitudeCreditedCount: 0,
            createdAt: now,
        });

        const savedConsumption = await this.consumptionRepo.save(consumption);

        // Atualiza lastSeenAt da aplicação
        if (app) {
            app.lastSeenAt = now;
            if (gitHash && !app.gitVersionHash) {
                app.gitVersionHash = gitHash;
            }
            await this.repo.save(app);
        }

        // Obtém todos os autores e co-autores da aplicação
        const authorEntries = new Set<string>();
        if (app?.authors && Array.isArray(app.authors)) {
            for (const a of app.authors) if (a && a.trim()) authorEntries.add(a.trim());
        }
        if (app?.coAuthors && Array.isArray(app.coAuthors)) {
            for (const ca of app.coAuthors) if (ca && ca.trim()) authorEntries.add(ca.trim());
        }
        if (authorEntries.size === 0 && app?.collaborators && Array.isArray(app.collaborators)) {
            for (const c of app.collaborators) if (c && c.trim()) authorEntries.add(c.trim());
        }

        let creditedCount = 0;

        for (const rawAuthor of authorEntries) {
            let email = '';
            let name = rawAuthor.trim();
            const emailMatch = /<([^>]+)>/.exec(rawAuthor);
            if (emailMatch && emailMatch[1]) {
                email = emailMatch[1].trim().toLowerCase();
                name = rawAuthor.replace(/<[^>]+>/, '').trim();
            } else if (rawAuthor.includes('@')) {
                email = rawAuthor.trim().toLowerCase();
            }

            if (!email) continue;

            // Busca usuário desenvolvedor correspondente
            let devUser: User | null = null;
            try {
                devUser = await this.userRepo.findOne({
                    where: [
                        { email: email },
                        { username: name }
                    ]
                });
            } catch {}

            // Busca configuração de perfil de gratidão do desenvolvedor
            let config: DeveloperGratitudeConfig | null = null;
            if (devUser?.id) {
                try {
                    config = await this.gratitudeConfigRepo.findOneBy({ developerUserId: devUser.id });
                } catch {}
            }

            const unitValue = config ? Number(config.unitValue) : 0.10;
            const autoConvert = config ? Boolean(config.autoConvert) : false;

            const gratitude = this.gratitudeRepo.create({
                authorEmail: email,
                authorName: name,
                developerUserId: devUser?.id,
                appKey: cleanKey,
                applicationId: app?.id,
                consumptionId: savedConsumption.id,
                credits: 1,
                isConverted: false,
                createdAt: now,
            });

            const savedGratitude = await this.gratitudeRepo.save(gratitude);
            creditedCount++;

            // Se autoConvert estiver ativo e houver CarteiraService e usuário vinculado, converte direto para saldo
            if (autoConvert && devUser?.id && this.carteiraService) {
                try {
                    const depositResult = await this.carteiraService.registrarDeposito(devUser.id, {
                        valor: unitValue,
                        descricao: `Crédito de gratidão automático pelo uso do app ${cleanKey}`,
                        metadados: {
                            appKey: cleanKey,
                            gratitudeId: savedGratitude.id,
                            consumptionId: savedConsumption.id,
                            unitValue
                        }
                    });

                    savedGratitude.isConverted = true;
                    savedGratitude.convertedAt = new Date();
                    savedGratitude.transacaoFinanceiraId = (depositResult?.transacao as any)?.id || (depositResult?.transacao as any)?.internalId;
                    savedGratitude.convertedValor = unitValue;
                    savedGratitude.unitValueAtConversion = unitValue;
                    await this.gratitudeRepo.save(savedGratitude);
                } catch (err) {
                    console.warn(`[ApplicationService] Falha ao autoconverter gratidão para usuário ${devUser.id}:`, err?.message || err);
                }
            }
        }

        savedConsumption.gratitudeCreditedCount = creditedCount;
        await this.consumptionRepo.save(savedConsumption);

        return {
            consumptionId: savedConsumption.id,
            appKey: cleanKey,
            creditedCount
        };
    }

    /**
     * Obtém o resumo dos créditos de gratidão do desenvolvedor autenticado,
     * total não convertido, total já convertido, valor unitário configurado e saldo financeiro calculado.
     * "Cada usuário ROLE DEVELOPER pode configurar quanto vale sua gratidão em seu perfil,
     * e essa é considerada para calcular o saldo."
     */
    async getDeveloperGratitudeSummary(user: User) {
        if (!user || (!user.roles?.includes('DEVELOPER') && !user.roles?.includes('ADMIN') && !user.roles?.includes('MASTER'))) {
            throw new ForbiddenException('Apenas usuários com papel DEVELOPER têm acesso ao perfil de gratidão.');
        }

        const devUserId = user.id;
        const devEmail = user.email?.toLowerCase().trim();

        // Busca configuração do desenvolvedor
        let config: DeveloperGratitudeConfig | null = null;
        if (devUserId) {
            config = await this.gratitudeConfigRepo.findOneBy({ developerUserId: devUserId });
        }

        const unitValue = config ? Number(config.unitValue) : 0.10;
        const autoConvert = config ? Boolean(config.autoConvert) : false;

        // Query créditos atribuídos ao desenvolvedor
        const query = this.gratitudeRepo.createQueryBuilder('g')
            .where('(g.developerUserId = :devUserId' + (devEmail ? ' OR LOWER(g.authorEmail) = :devEmail' : '') + ')', {
                devUserId,
                devEmail
            });

        const allCredits = await query.orderBy('g.createdAt', 'DESC').getMany();

        let unconvertedCredits = 0;
        let convertedCredits = 0;
        let totalEarnedValor = 0;
        const appBreakdown: Record<string, { appKey: string; totalCredits: number; unconverted: number; converted: number }> = {};

        for (const item of allCredits) {
            if (!appBreakdown[item.appKey]) {
                appBreakdown[item.appKey] = {
                    appKey: item.appKey,
                    totalCredits: 0,
                    unconverted: 0,
                    converted: 0
                };
            }

            appBreakdown[item.appKey].totalCredits += item.credits;

            if (item.isConverted) {
                convertedCredits += item.credits;
                totalEarnedValor += Number(item.convertedValor) || 0;
                appBreakdown[item.appKey].converted += item.credits;
            } else {
                unconvertedCredits += item.credits;
                appBreakdown[item.appKey].unconverted += item.credits;
            }
        }

        const estimatedBalance = Number((unconvertedCredits * unitValue).toFixed(2));

        return {
            developerUserId: devUserId,
            developerEmail: devEmail,
            unitValue,
            autoConvert,
            unconvertedCredits,
            convertedCredits,
            totalCredits: unconvertedCredits + convertedCredits,
            estimatedBalance,
            totalEarnedValor: Number(totalEarnedValor.toFixed(2)),
            appBreakdown: Object.values(appBreakdown),
            recentHistory: allCredits.slice(0, 20)
        };
    }

    /**
     * Atualiza a configuração de quanto vale a gratidão no perfil do desenvolvedor.
     * "Cada usuário ROLE DEVELOPER pode configurar quanto vale sua gratidão em seu perfil,
     * e essa é considerada para calcular o saldo."
     */
    async setDeveloperGratitudeConfig(user: User, dto: DeveloperGratitudeConfigDto) {
        if (!user || (!user.roles?.includes('DEVELOPER') && !user.roles?.includes('ADMIN') && !user.roles?.includes('MASTER'))) {
            throw new ForbiddenException('Apenas usuários com papel DEVELOPER podem configurar o valor da gratidão.');
        }

        if (dto.unitValue === undefined || dto.unitValue === null || isNaN(Number(dto.unitValue)) || Number(dto.unitValue) < 0) {
            throw new BadRequestException('O valor unitário da gratidão deve ser um número maior ou igual a zero.');
        }

        let config = await this.gratitudeConfigRepo.findOneBy({ developerUserId: user.id });
        if (!config) {
            config = this.gratitudeConfigRepo.create({
                developerUserId: user.id,
                unitValue: Number(dto.unitValue),
                autoConvert: Boolean(dto.autoConvert),
            });
        } else {
            config.unitValue = Number(dto.unitValue);
            if (dto.autoConvert !== undefined) {
                config.autoConvert = Boolean(dto.autoConvert);
            }
        }

        const savedConfig = await this.gratitudeConfigRepo.save(config);
        return {
            success: true,
            developerUserId: user.id,
            unitValue: Number(savedConfig.unitValue),
            autoConvert: Boolean(savedConfig.autoConvert),
            updatedAt: savedConfig.updatedAt
        };
    }

    /**
     * Converte créditos de gratidão acumulados pelo desenvolvedor em saldo financeiro na sua carteira.
     * "que credita para cada autor um crédito de gratidão que pode ou não ser convertido em saldo no financeiro."
     */
    async convertGratitudeToBalance(user: User, requestedCredits?: number) {
        if (!user || (!user.roles?.includes('DEVELOPER') && !user.roles?.includes('ADMIN') && !user.roles?.includes('MASTER'))) {
            throw new ForbiddenException('Apenas usuários com papel DEVELOPER podem converter gratidão em saldo financeiro.');
        }

        if (!this.carteiraService) {
            throw new BadRequestException('Serviço financeiro de carteira indisponível no momento.');
        }

        const devUserId = user.id;
        const devEmail = user.email?.toLowerCase().trim();

        // Busca configuração do desenvolvedor para saber quanto vale cada gratidão
        let config: DeveloperGratitudeConfig | null = null;
        if (devUserId) {
            config = await this.gratitudeConfigRepo.findOneBy({ developerUserId: devUserId });
        }

        const unitValue = config ? Number(config.unitValue) : 0.10;
        if (unitValue <= 0) {
            throw new BadRequestException('O valor unitário da gratidão configurado em seu perfil é zero. Configure um valor maior que zero para converter em saldo financeiro.');
        }

        // Busca créditos pendentes de conversão
        const query = this.gratitudeRepo.createQueryBuilder('g')
            .where('g.isConverted = false')
            .andWhere('(g.developerUserId = :devUserId' + (devEmail ? ' OR LOWER(g.authorEmail) = :devEmail' : '') + ')', {
                devUserId,
                devEmail
            })
            .orderBy('g.createdAt', 'ASC');

        const pendentes = await query.getMany();

        if (!pendentes || pendentes.length === 0) {
            throw new BadRequestException('Não há créditos de gratidão pendentes para conversão.');
        }

        let aConverter = pendentes;
        if (requestedCredits && requestedCredits > 0 && requestedCredits < pendentes.length) {
            aConverter = pendentes.slice(0, requestedCredits);
        }

        const totalCredits = aConverter.reduce((acc, curr) => acc + curr.credits, 0);
        const valorTotal = Number((totalCredits * unitValue).toFixed(2));

        if (valorTotal <= 0) {
            throw new BadRequestException('O valor total a ser creditado deve ser superior a R$ 0,00.');
        }

        // Executa depósito na Carteira do Financeiro
        const appKeys = Array.from(new Set(aConverter.map(c => c.appKey))).join(', ');
        const depositResult = await this.carteiraService.registrarDeposito(user.id, {
            valor: valorTotal,
            descricao: `Conversão de ${totalCredits} crédito(s) de gratidão (Apps: ${appKeys})`,
            metadados: {
                tipo: 'CONVERSAO_GRATIDAO_DEVELOPER',
                totalCredits,
                unitValue,
                apps: appKeys
            }
        });

        const now = new Date();
        const transacaoId = (depositResult?.transacao as any)?.id || (depositResult?.transacao as any)?.internalId;

        for (const item of aConverter) {
            item.isConverted = true;
            item.convertedAt = now;
            item.developerUserId = user.id;
            item.transacaoFinanceiraId = transacaoId;
            item.convertedValor = Number((item.credits * unitValue).toFixed(2));
            item.unitValueAtConversion = unitValue;
            await this.gratitudeRepo.save(item);
        }

        return {
            success: true,
            convertedCredits: totalCredits,
            unitValue,
            creditedValor: valorTotal,
            transacao: depositResult?.transacao,
            carteira: depositResult?.carteira,
            remainingUnconvertedCredits: pendentes.length - aConverter.length
        };
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
