import { createNgModule, Injectable, Injector, Optional } from "@angular/core";
import { Route, Router, ROUTES } from "@angular/router";
import { ApplicationService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

export interface IAppManifestEntry {
    component?: any;
    label?: string;
    title?: string;
    description?: string;
    icon?: string;
    queryParam?: string;
    fallback?: boolean;
    /** Permite que uma entrada de manifesto também declare um tipo dinâmico de schema/formulário */
    dynamicType?: string | Partial<IDynamicSchemaType>;
    schemaType?: string | Partial<IDynamicSchemaType>;
    openInWindow?: boolean;
    windowTitle?: string;
    [key: string]: any;
}

export interface IDynamicSchemaTypeContext {
    fieldName?: string;
    label?: string;
    description?: string;
    type?: string;
    format?: string;
    value?: any;
    schemaName?: string;
    schemaProperty?: any;
    formGroup?: any;
    formControl?: any;
    data?: any;
}

export interface IDynamicSchemaType {
    /** Nome identificador do tipo dinâmico (ex: 'ts', 'typescript', 'code', 'map', 'dynamic') */
    type: string;
    /** Formato associado opcional (ex: 'ts', 'code', 'map') */
    format?: string;
    /** Extensões ou padrões associados (ex: ['*.ts', '*.map']) */
    filePatterns?: string[];
    /** Rótulo de apresentação */
    label?: string;
    description?: string;
    icon?: string;
    /** Componente Angular injetado pelo módulo `ci-application` */
    component?: any;
    /** Quando verdadeiro, abre o componente em janela via `WindowService` */
    openInWindow?: boolean;
    /** Título padrão exibido na janela */
    windowTitle?: string;
    queryParam?: string;
    inputs?: Record<string, any>;
    appName?: string;
    fullPath?: string;
    buildWindowData?: (ctx: IDynamicSchemaTypeContext) => any;
    extractResultValue?: (result: any, ctx: IDynamicSchemaTypeContext) => any;
}

export interface RouteMetadata {
    fullPath: string;
    title?: string;
    appName?: string;
    icon?: string;
    description?: string;
    queryParam?: string;
    role?: string;
    roles?: string[];
    group?: string;
    navbar?: any;
    startMenu?: any;
    endMenu?: any;
    userMenu?: any;
    manifest?: Record<string, IAppManifestEntry>;
    dynamicType?: Partial<IDynamicSchemaType>;
    dynamicTypes?: Array<Partial<IDynamicSchemaType>> | Record<string, Partial<IDynamicSchemaType>>;
    dynTypes?: Array<Partial<IDynamicSchemaType>> | Record<string, Partial<IDynamicSchemaType>>;
    schemaTypes?: Array<Partial<IDynamicSchemaType>> | Record<string, Partial<IDynamicSchemaType>>;
    files?: Array<{ format: string; label?: string; queryParam?: string }>;
    data?: any;
    routeConfig?: Route;
    [key: string]: any;
}

export interface IInention {
    action?: 'open' | 'edit' | 'preview' | 'explore' | string;
    fileFormat?: string;
    encoding?: string;
    fileName?: string;
    path?: string;
}

export interface IAppInteractionMatch {
    id: string;
    fullPath: string;
    appName: string;
    title: string;
    label: string;
    description?: string;
    icon: string;
    queryParam: string;
    matchedPattern: string;
    component?: any;
    isFallback: boolean;
    isPreferred: boolean;
}

const PREFERRED_APPS_STORAGE_KEY = 'CI.PreferredAppsByFormat';

@Injectable({
    providedIn: 'root'
})
export class Apps {
    private cachedRoutesMetadata?: RouteMetadata[];
    private extractingPromise?: Promise<RouteMetadata[]>;
    private registeredDynamicTypes: IDynamicSchemaType[] = [];
    private cachedDynamicTypes?: IDynamicSchemaType[];

    constructor(
        private injector: Injector,
        @Optional() private readonly router?: Router,
        @Optional() private readonly apps?: ApplicationService,
    ) { }

    /**
     * Registra programaticamente um tipo dinâmico de schema/formulário em tempo de execução.
     */
    registerDynamicType(config: IDynamicSchemaType): void {
        if (!config?.type) return;
        const normType = config.type.trim().toLowerCase();
        const existingIdx = this.registeredDynamicTypes.findIndex(
            t => t.type.toLowerCase() === normType && (t.format || '').toLowerCase() === (config.format || '').toLowerCase()
        );
        const normalized: IDynamicSchemaType = {
            ...config,
            type: config.type.trim(),
        };
        if (existingIdx > -1) {
            this.registeredDynamicTypes[existingIdx] = normalized;
        } else {
            this.registeredDynamicTypes.push(normalized);
        }
        this.cachedDynamicTypes = undefined;
    }

    /**
     * Retorna os tipos dinâmicos atualmente em cache ou registrados diretamente.
     */
    getDynamicTypesSync(): IDynamicSchemaType[] {
        return [...this.registeredDynamicTypes, ...(this.cachedDynamicTypes || [])];
    }

    /**
     * Extrai e consolida todos os tipos dinâmicos declarados via `data` nas rotas de módulos `ci-application`.
     */
    async getDynamicTypes(forceRefresh = false): Promise<IDynamicSchemaType[]> {
        if (!forceRefresh && this.cachedDynamicTypes) {
            return [...this.registeredDynamicTypes, ...this.cachedDynamicTypes];
        }

        const routesMeta = await this.getRoutesMetadata(forceRefresh);
        const collected: IDynamicSchemaType[] = [];
        const seen = new Set<string>();

        const pushType = (raw: Partial<IDynamicSchemaType> | undefined, fallbackKey: string | undefined, meta: RouteMetadata) => {
            if (!raw || typeof raw !== 'object') return;
            const resolvedType = (raw.type || fallbackKey || '').trim();
            if (!resolvedType) return;
            const appName = raw.appName || meta['appName'] || this.inferAppNameFromPath(meta.fullPath);
            const dedupKey = `${resolvedType.toLowerCase()}::${(raw.format || '').toLowerCase()}::${meta.fullPath}`;
            if (seen.has(dedupKey)) return;
            seen.add(dedupKey);

            collected.push({
                ...raw,
                type: resolvedType,
                format: raw.format || resolvedType,
                label: raw.label || meta.title || resolvedType,
                icon: raw.icon || meta['icon'] || 'extension',
                component: raw.component || (meta.routeConfig?.component),
                queryParam: raw.queryParam || meta['queryParam'] || 'file',
                appName,
                fullPath: raw.fullPath || meta.fullPath,
            });
        };

        for (const meta of routesMeta) {
            if (!meta) continue;
            if (meta.dynamicType && typeof meta.dynamicType === 'object') {
                pushType(meta.dynamicType, meta.dynamicType.type, meta);
            }

            const sources = [meta.dynamicTypes, meta.dynTypes, meta.schemaTypes];
            for (const src of sources) {
                if (!src) continue;
                if (Array.isArray(src)) {
                    for (const item of src) {
                        pushType(item, item?.type, meta);
                    }
                } else if (typeof src === 'object') {
                    for (const [key, item] of Object.entries(src)) {
                        pushType(item, key, meta);
                    }
                }
            }

            if (meta.manifest && typeof meta.manifest === 'object') {
                for (const [manifestKey, entry] of Object.entries(meta.manifest)) {
                    if (!entry || (!entry.dynamicType && !entry.schemaType)) continue;
                    const dynMeta = typeof entry.dynamicType === 'object'
                        ? entry.dynamicType
                        : typeof entry.schemaType === 'object'
                            ? entry.schemaType
                            : { type: String(entry.dynamicType || entry.schemaType) };
                    const patterns = manifestKey.split(':').slice(2).join(':')
                        .split(/[,|]/)
                        .map(s => s.trim())
                        .filter(Boolean);
                    pushType({
                        ...dynMeta,
                        label: dynMeta.label || entry.label || entry.title,
                        icon: dynMeta.icon || entry.icon,
                        component: dynMeta.component || entry.component,
                        openInWindow: dynMeta.openInWindow ?? entry.openInWindow,
                        windowTitle: dynMeta.windowTitle || entry.windowTitle,
                        queryParam: dynMeta.queryParam || entry.queryParam,
                        filePatterns: dynMeta.filePatterns || (patterns.length ? patterns : undefined),
                    }, dynMeta.type, meta);
                }
            }
        }

        this.cachedDynamicTypes = collected;
        return [...this.registeredDynamicTypes, ...collected];
    }

    /**
     * Resolve qual tipo dinâmico injetado atende a um campo de schema pelo tipo, formato ou extensão.
     */
    async resolveDynamicType(criteria: {
        type?: string;
        format?: string;
        fieldName?: string;
        value?: any;
    }): Promise<IDynamicSchemaType | undefined> {
        const list = await this.getDynamicTypes();
        return this.matchDynamicTypeFromList(list, criteria);
    }

    resolveDynamicTypeSync(criteria: {
        type?: string;
        format?: string;
        fieldName?: string;
        value?: any;
    }): IDynamicSchemaType | undefined {
        return this.matchDynamicTypeFromList(this.getDynamicTypesSync(), criteria);
    }

    private matchDynamicTypeFromList(
        list: IDynamicSchemaType[],
        criteria: { type?: string; format?: string; fieldName?: string; value?: any }
    ): IDynamicSchemaType | undefined {
        if (!list || list.length === 0) return undefined;

        const normType = (criteria.type || '').trim().toLowerCase();
        const normFormat = (criteria.format || '').trim().toLowerCase().replace(/^\./, '');
        const strValue = typeof criteria.value === 'string' ? criteria.value.trim().toLowerCase() : '';
        const valueExt = strValue.includes('.') ? strValue.substring(strValue.lastIndexOf('.')).toLowerCase() : '';

        // 1. Match exato por type diferente de 'dynamic'
        if (normType && normType !== 'dynamic') {
            const byType = list.find(d => d.type.toLowerCase() === normType);
            if (byType) return byType;
        }

        // 2. Match por format (ex: format: 'ts', 'typescript', 'map', 'code')
        if (normFormat) {
            const byFormat = list.find(d =>
                d.type.toLowerCase() === normFormat ||
                (d.format || '').toLowerCase().replace(/^\./, '') === normFormat ||
                (d.filePatterns || []).some(p => p.toLowerCase().replace(/^\*?\./, '') === normFormat)
            );
            if (byFormat) return byFormat;
        }

        // 3. Match por extensão presente no valor (ex: arquivo .ts ou .map)
        if (valueExt) {
            const byExt = list.find(d =>
                (d.filePatterns || []).some(p => {
                    const cleanP = p.trim().toLowerCase();
                    return cleanP === `*${valueExt}` || cleanP === valueExt;
                })
            );
            if (byExt) return byExt;
        }

        // 4. Quando o campo declarar explicitamente type === 'dynamic', usa o primeiro tipo dinâmico compatível ou padrão
        if (normType === 'dynamic') {
            return list[0];
        }

        return undefined;
    }

    /**
     * Resolve uma intenção de interação (ex: abrir um arquivo de determinado formato)
     * consultando os metadados (`data.manifest` e `data.files`) declarados nas rotas
     * de todos os aplicativos disponíveis.
     *
     * Caso o usuário tenha definido um aplicativo preferido para o formato (ou exista
     * apenas um aplicativo específico compatível e `autoNavigate` seja verdadeiro),
     * realiza a navegação automaticamente.
     */
    async RequireOpen(
        intention: IInention,
        options?: { autoNavigate?: boolean; preferredOnly?: boolean }
    ): Promise<IAppInteractionMatch[]> {
        const matches = await this.findCompatibleApps(intention);
        if (matches.length === 0) return [];

        const preferred = matches.find(m => m.isPreferred);
        const specificMatches = matches.filter(m => !m.isFallback);

        if (options?.autoNavigate !== false) {
            if (preferred) {
                await this.openWithApp(preferred, intention);
                return matches;
            }
            if (!options?.preferredOnly && specificMatches.length === 1) {
                await this.openWithApp(specificMatches[0], intention);
                return matches;
            }
        }

        return matches;
    }

    /**
     * Navega para a rota do aplicativo escolhido enviando o caminho do arquivo/recurso
     * no parâmetro de query configurado pelo manifesto da rota (padrão: `file`).
     */
    async openWithApp(app: IAppInteractionMatch, intention: IInention): Promise<boolean> {
        if (!this.router || !app?.fullPath) return false;
        const paramName = app.queryParam || 'file';
        const targetValue = intention.path || intention.fileName || '';
        const cleanSegments = app.fullPath.split('/').filter(Boolean);
        return await this.router.navigate(['/', ...cleanSegments], {
            queryParams: {
                [paramName]: targetValue,
            }
        });
    }

    /**
     * Retorna todos os aplicativos cujas rotas declaram suporte à intenção/formato informado.
     */
    async findCompatibleApps(intention: IInention): Promise<IAppInteractionMatch[]> {
        const routesMeta = await this.getRoutesMetadata();
        const action = (intention.action || 'open').toLowerCase();
        const ext = this.normalizeExtension(intention.fileFormat || intention.fileName || intention.path || '');
        const fileName = (intention.fileName || intention.path || '').split('/').pop()?.toLowerCase() || '';
        const preferredPath = this.getPreferredAppPath(ext || `*`);

        const results: IAppInteractionMatch[] = [];
        const seenPaths = new Set<string>();

        for (const meta of routesMeta) {
            const fullPath = meta.fullPath;
            if (!fullPath) continue;

            const appName = meta['appName'] || this.inferAppNameFromPath(fullPath);
            const baseTitle = meta.title || appName;
            const baseIcon = meta['icon'] || 'open_in_new';
            const baseQueryParam = meta['queryParam'] || 'file';

            // 1. Verifica data.manifest (ex: 'event:open:*.ts', 'event:open:*')
            if (meta.manifest && typeof meta.manifest === 'object') {
                let bestRuleForRoute: { pattern: string; entry: IAppManifestEntry; isFallback: boolean } | undefined;

                for (const [key, entry] of Object.entries(meta.manifest)) {
                    const matchInfo = this.matchManifestKey(key, action, ext, fileName, Boolean(entry?.fallback));
                    if (matchInfo.matched) {
                        if (!bestRuleForRoute || (bestRuleForRoute.isFallback && !matchInfo.isFallback)) {
                            bestRuleForRoute = {
                                pattern: key,
                                entry: entry || {},
                                isFallback: matchInfo.isFallback,
                            };
                        }
                    }
                }

                if (bestRuleForRoute && !seenPaths.has(fullPath)) {
                    seenPaths.add(fullPath);
                    const { pattern, entry, isFallback } = bestRuleForRoute;
                    results.push({
                        id: `${fullPath}::${pattern}`,
                        fullPath,
                        appName,
                        title: entry.title || baseTitle,
                        label: entry.label || `${entry.title || baseTitle}`,
                        description: entry.description || meta['description'],
                        icon: entry.icon || baseIcon,
                        queryParam: entry.queryParam || baseQueryParam,
                        matchedPattern: pattern,
                        component: entry.component,
                        isFallback,
                        isPreferred: preferredPath === fullPath,
                    });
                }
            }

            // 2. Verifica data.files legado/alternativo (ex: files: [{ format: 'png' }, { format: 'jpg' }])
            if (Array.isArray(meta.files) && ext) {
                const cleanExt = ext.replace(/^\./, '').toLowerCase();
                const fileRule = meta.files.find(
                    f => f?.format && f.format.replace(/^\./, '').toLowerCase() === cleanExt
                );
                if (fileRule && !seenPaths.has(fullPath)) {
                    seenPaths.add(fullPath);
                    results.push({
                        id: `${fullPath}::files:${cleanExt}`,
                        fullPath,
                        appName,
                        title: baseTitle,
                        label: fileRule.label || `${baseTitle} (${appName})`,
                        description: meta['description'],
                        icon: baseIcon,
                        queryParam: fileRule.queryParam || baseQueryParam,
                        matchedPattern: `files:*.${cleanExt}`,
                        isFallback: false,
                        isPreferred: preferredPath === fullPath,
                    });
                }
            }
        }

        // Ordena: 1º App Preferido do Usuário -> 2º Matches Específicos -> 3º Fallbacks Genéricos -> Ordem Alfabética
        return results.sort((a, b) => {
            if (a.isPreferred !== b.isPreferred) return a.isPreferred ? -1 : 1;
            if (a.isFallback !== b.isFallback) return a.isFallback ? 1 : -1;
            return a.title.localeCompare(b.title, 'pt-BR');
        });
    }

    /**
     * Obtém os metadados de todas as rotas da aplicação (incluindo módulos lazy-loaded),
     * mantendo cache em memória para consultas instantâneas.
     */
    async getRoutesMetadata(forceRefresh = false): Promise<RouteMetadata[]> {
        if (!forceRefresh && this.cachedRoutesMetadata) {
            return this.cachedRoutesMetadata;
        }
        if (this.extractingPromise && !forceRefresh) {
            return this.extractingPromise;
        }
        if (!this.router) return [];

        this.extractingPromise = this.ExtractRecursivelyMetedataApplicationRouters(this.router.config, '')
            .then(routes => {
                this.cachedRoutesMetadata = routes;
                this.extractingPromise = undefined;
                return routes;
            })
            .catch(err => {
                console.error('Erro ao extrair metadados de rotas:', err);
                this.extractingPromise = undefined;
                return this.cachedRoutesMetadata || [];
            });

        return this.extractingPromise;
    }

    /**
     * Gerenciamento de Aplicativos Preferidos do Usuário por formato/extensão
     */
    getAllPreferredApps(): Record<string, string> {
        try {
            const raw = localStorage.getItem(PREFERRED_APPS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch {
            // ignora erro de parse
        }
        return {};
    }

    getPreferredAppPath(formatOrExtension: string): string | undefined {
        const key = this.normalizeExtension(formatOrExtension);
        if (!key) return undefined;
        const map = this.getAllPreferredApps();
        return map[key];
    }

    setPreferredApp(formatOrExtension: string, fullPath: string | null) {
        const key = this.normalizeExtension(formatOrExtension);
        if (!key) return;
        const map = this.getAllPreferredApps();
        if (!fullPath) {
            delete map[key];
        } else {
            map[key] = fullPath;
        }
        try {
            localStorage.setItem(PREFERRED_APPS_STORAGE_KEY, JSON.stringify(map));
        } catch (e) {
            console.trace(e);
        }
    }

    normalizeExtension(input?: string): string {
        if (!input) return '';
        const trimmed = input.trim().toLowerCase();
        if (!trimmed) return '';
        if (trimmed === '*') return '*';
        if (trimmed.startsWith('*.')) return trimmed.substring(1);
        if (trimmed.startsWith('.')) return trimmed;
        if (trimmed.includes('.')) {
            const idx = trimmed.lastIndexOf('.');
            return trimmed.substring(idx);
        }
        return `.${trimmed}`;
    }

    private inferAppNameFromPath(fullPath: string): string {
        const firstSeg = fullPath.split('/').filter(Boolean)[0];
        return firstSeg || 'App';
    }

    private matchManifestKey(
        manifestKey: string,
        action: string,
        ext: string,
        fileName: string,
        explicitFallback: boolean
    ): { matched: boolean; isFallback: boolean } {
        // Formato esperado: 'event:<acao>:<padrao>' (ex: 'event:open:*.ts', 'event:open:*')
        const parts = manifestKey.toLowerCase().split(':');
        if (parts.length < 3 || parts[0] !== 'event') {
            return { matched: false, isFallback: false };
        }
        const keyAction = parts[1];
        const pattern = parts.slice(2).join(':');

        if (keyAction !== action && keyAction !== '*') {
            return { matched: false, isFallback: false };
        }

        if (pattern === '*' || pattern === '*.*') {
            return { matched: true, isFallback: true };
        }

        // Suporte a múltiplos padrões separados por vírgula ou pipe: 'event:open:*.ts,*.js'
        const subPatterns = pattern.split(/[,|]/).map(p => p.trim()).filter(Boolean);
        for (const sub of subPatterns) {
            if (sub === '*' || sub === '*.*') {
                return { matched: true, isFallback: true };
            }
            if (sub.startsWith('*.')) {
                const wantedExt = sub.substring(1); // ex: '.ts'
                if (ext && ext === wantedExt) {
                    return { matched: true, isFallback: explicitFallback };
                }
            } else if (sub.startsWith('.')) {
                if (ext && ext === sub) {
                    return { matched: true, isFallback: explicitFallback };
                }
            } else if (fileName && fileName === sub) {
                return { matched: true, isFallback: explicitFallback };
            }
        }

        return { matched: false, isFallback: false };
    }

    async preparePreloadedApplication() {
        let apps_to_catalog: any[] = [];
        let current_apps = await lastValueFrom(this.apps!.getList({ body: { all: true } }));
        let routes_on_build = await this.getRoutesMetadata(true);
        routes_on_build.forEach(ro => {
            const current_app = current_apps.find(app => app.name === ro.title || app.url === ro.fullPath);
            if (!current_app) {
                apps_to_catalog.push(ro);
            }
        });
        if (apps_to_catalog.length > 0) {
            apps_to_catalog = apps_to_catalog;
        }
    }

    /**
     * Função recursiva para varrer rotas filhas lazy e não-lazy
     */
    public async ExtractRecursivelyMetedataApplicationRouters(routes: Route[], parentPath: string): Promise<RouteMetadata[]> {
        const extracted: RouteMetadata[] = [];
        for (const route of routes) {
            if (route.path === '**') continue;
            // 1. Tratamento seguro do Path (protege contra undefined e path vazio)
            const pathString = route.path != null ? route.path : '';
            const currentSegment = pathString !== '' ? `/${pathString}` : '';
            // Monta o caminho completo e limpa múltiplas barras
            let fullPath = `${parentPath}${currentSegment}`.replace(/\/+/g, '/');
            if (!fullPath || fullPath === '') {
                fullPath = '/';
            }
            // 2. Extrai os dados se o objeto 'data' ou 'title' existir
            if (route.data || typeof route.title === 'string') {
                extracted.push({
                    fullPath,
                    ...(typeof route.title === 'string' ? { title: route.title } : {}),
                    ...(route.data || {}),
                    routeConfig: route,
                });
            }
            // 3. Sub-rotas estáticas (children não-lazy)
            if (route.children && route.children.length > 0) {
                const childrenMeta = await this.ExtractRecursivelyMetedataApplicationRouters(route.children, fullPath);
                extracted.push(...childrenMeta);
            }
            // 4. Sub-rotas dinâmicas (loadChildren)
            if (route.loadChildren) {
                try {
                    const loadedContent = await (route.loadChildren as any)();
                    let childRoutes: Route[] = [];
                    const resolvedContent = (loadedContent && typeof loadedContent === 'object' && !Array.isArray(loadedContent))
                        ? (loadedContent.default || Object.values(loadedContent)[0])
                        : loadedContent;
                    if (Array.isArray(resolvedContent)) {
                        childRoutes = resolvedContent;
                    } else if (typeof resolvedContent === 'function') {
                        const moduleRef = createNgModule(resolvedContent, this.injector);
                        const routesInModule = moduleRef.injector.get(ROUTES, []);
                        childRoutes = this.flattenDeep(routesInModule);
                    }
                    if (childRoutes && childRoutes.length > 0) {
                        const lazyChildrenMeta = await this.ExtractRecursivelyMetedataApplicationRouters(childRoutes, fullPath);
                        extracted.push(...lazyChildrenMeta);
                    }
                } catch (error) {
                    console.error(`Falha ao extrair a rota lazy em ${fullPath}`, error);
                }
            }
        }
        return extracted;
    }

    /**
     * Função auxiliar para achatar arrays de rotas que o RouterModule.forChild
     * pode ter aninhado profundamente dentro do Injector do NgModule.
     */
    private flattenDeep(arr: any[]): Route[] {
        return arr.reduce((acc, val) =>
            Array.isArray(val) ? acc.concat(this.flattenDeep(val)) : acc.concat(val),
            []);
    }
}