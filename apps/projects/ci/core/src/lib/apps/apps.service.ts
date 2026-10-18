import { createNgModule, Injectable, Injector, Optional } from "@angular/core";
import { Route, Router, ROUTES } from "@angular/router";
import { UserAuthenticationService } from "@ci/auth";
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
    [key: string]: any;
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
    manifest?: Record<string, IAppManifestEntry>;
    files?: Array<{ format: string; label?: string; queryParam?: string }>;
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

    constructor(
        private injector: Injector,
        @Optional() private readonly uas?: UserAuthenticationService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly apps?: ApplicationService,
    ) { }

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
            // 2. Extrai os dados se o objeto 'data' existir
            if (route.data) {
                extracted.push({
                    fullPath,
                    ...route.data
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