import { createNgModule, Injectable, Injector, Optional } from "@angular/core";
import { Route, Router, ROUTES } from "@angular/router";
import { UserAuthenticationService } from "@ci/auth";
import { ApplicationService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
/**
 * 
 */
export interface RouteMetadata {
    fullPath: string;
    title?: string;
    role?: string;
    roles?: string[];
    //  date?: string;
    [key: string]: any;
}
/**
 * 
 */
export interface IInention {
    fileFormat?: string;
    encoding?: string;
    fileName?: string;
}
/**
 * 
 */
@Injectable()
export class Apps {
    constructor(
        private injector: Injector,
        @Optional() private readonly uas?: UserAuthenticationService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly apps?: ApplicationService,
    ) { }
    async RequireOpen(intention: IInention) { }
    async preparePreloadedApplication() {
        // if (isDevMode()) {
        let apps_to_catalog: any[] = [];
        let current_apps = await lastValueFrom(this.apps!.getList({ body: { all: true } }));
        let routes_on_build = await this.ExtractRecursivelyMetedataApplicationRouters(this.router!.config, '');
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
    private async ExtractRecursivelyMetedataApplicationRouters(routes: Route[], parentPath: string): Promise<RouteMetadata[]> {
        const extracted: RouteMetadata[] = [];
        for (const route of routes) {
            // 1. Tratamento seguro do Path (protege contra undefined e path vazio)
            const pathString = route.path != null ? route.path : '';
            const currentSegment = pathString !== '' ? `/${pathString}` : '';
            // Monta o caminho completo e limpa múltiplas barras
            let fullPath = `${parentPath}${currentSegment}`.replace(/\/+/g, '/');
            if (!fullPath || fullPath === '') {
                fullPath = '/';
            }
            // 2. Extrai os dados se o objeto 'data' existir
            // (Removido o Object.keys para evitar falhas com objetos gerados por herança de protótipo)
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
                    // Desempacota exports caso o import() venha sem o .then()
                    const resolvedContent = (loadedContent && typeof loadedContent === 'object' && !Array.isArray(loadedContent))
                        ? (loadedContent.default || Object.values(loadedContent)[0])
                        : loadedContent;
                    if (Array.isArray(resolvedContent)) {
                        // Standalone Components
                        childRoutes = resolvedContent;
                    } else if (typeof resolvedContent === 'function') {
                        // NgModule Legado
                        const moduleRef = createNgModule(resolvedContent, this.injector);
                        const routesInModule = moduleRef.injector.get(ROUTES, []);
                        // CORREÇÃO CRÍTICA: Deep flatten (achata infinitos níveis de arrays)
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