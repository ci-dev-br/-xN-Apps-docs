import { Injectable, Inject, Optional, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GIT_VERSION } from '../version/git-version';
import { CORE_ENV, ICoreEnvironment } from '../provider';
import { IAppDocumentation } from './app-docs.model';
import { AppDocDialogComponent } from './app-doc-dialog.component';

export interface ICatalogAppPayload {
    appKey: string;
    routePath?: string | null;
    name?: string | null;
    description?: string | null;
    icon?: string | null;
    categoria?: string | null;
    roles?: string[] | null;
    gitVersionHash?: string | null;
    collaborators?: string[] | null;
    contextPolicies?: Record<string, any> | null;
}

@Injectable({
    providedIn: 'root'
})
export class ApplicationCatalogService {
    /**
     * Chave da aplicação atualmente ativa acessível de forma estática e síncrona
     * para interceptors HTTP.
     */
    public static currentAppKey: string | null = null;
    public static currentAppRoute: string | null = null;

    private readonly _currentApp$ = new BehaviorSubject<string | null>(null);
    public readonly currentApp$: Observable<string | null> = this._currentApp$.asObservable();

    private readonly _activatedApps$ = new BehaviorSubject<Set<string>>(new Set<string>());
    public readonly activatedApps$: Observable<Set<string>> = this._activatedApps$.asObservable();

    private readonly catalogedInSession = new Set<string>();

    constructor(
        @Optional() private readonly http?: HttpClient,
        @Optional() private readonly router?: Router,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
    ) {
        if (typeof window !== 'undefined') {
            const initialApp = ApplicationCatalogService.detectFromUrl(window.location.pathname);
            if (initialApp) {
                this.setCurrentApp(initialApp, window.location.pathname);
            }
        }

        if (this.router) {
            this.router.events.pipe(
                filter(event => event instanceof NavigationEnd)
            ).subscribe((event: any) => {
                const detected = ApplicationCatalogService.detectFromUrl(event.urlAfterRedirects || event.url);
                if (detected) {
                    this.setCurrentApp(detected, event.urlAfterRedirects || event.url);
                }
            });
        }
    }

    /**
     * Detecta o identificador do aplicativo a partir da URL.
     * Trata rotas do tipo:
     * - /painel/Mensagens
     * - /painel/Arquivos/pasta/1
     * - /Mensagens
     */
    public static detectFromUrl(url: string): string | null {
        if (!url) return null;
        try {
            const cleanUrl = url.split('?')[0].split('#')[0];
            const segments = cleanUrl.split('/').filter(Boolean);
            if (segments.length === 0) return null;

            if (segments[0].toLowerCase() === 'painel') {
                if (segments.length > 1) {
                    const second = segments[1];
                    if (second === 'meus-apps' || second === 'launcher') return null;
                    return second;
                }
                return null;
            }

            // Acesso direto sem /painel
            const candidate = segments[0];
            const ignoreList = ['auth', 'login', 'assets', 'api', 'sw.js', 'manifest.webmanifest'];
            if (!ignoreList.includes(candidate.toLowerCase())) {
                return candidate;
            }
        } catch {
            return null;
        }
        return null;
    }

    /**
     * Define a aplicação ativa e atualiza o estado estático.
     */
    public setCurrentApp(appKey: string, routePath?: string) {
        ApplicationCatalogService.currentAppKey = appKey;
        ApplicationCatalogService.currentAppRoute = routePath || `/${appKey}`;
        this._currentApp$.next(appKey);
    }

    /**
     * Verifica no backend se a versão atual do cliente já foi catalogada.
     */
    public checkVersionCataloged(versionHash: string): Observable<{ isCataloged: boolean; catalog?: any }> {
        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/CheckVersion`;
        if (!this.http) return of({ isCataloged: false });
        return this.http.post<{ isCataloged: boolean; catalog?: any }>(url, { versionHash });
    }

    /**
     * Reconciliação do catálogo de aplicações:
     * Envia as aplicações hardcoded para o backend confrontar com o banco,
     * atualizar ativas, cadastrar novas e desativar removidas.
     * Requer ROLE MASTER.
     */
    public reconcileCatalog(staticApps: any[], gitInfo = GIT_VERSION): Observable<any> {
        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/Reconcile`;

        const payload = {
            versionHash: gitInfo.shortHash,
            branch: gitInfo.branch,
            collaborators: gitInfo.collaborators,
            apps: (staticApps || []).map(a => ({
                appKey: a.name || a.url?.replace(/^\//, ''),
                routePath: a.url,
                name: a.name,
                description: a.description || a.shortDescription,
                icon: a.icon,
                categoria: a.categoria || 'System',
                roles: a.roles,
                gitVersionHash: gitInfo.shortHash,
                collaborators: gitInfo.collaborators,
            }))
        };

        if (!this.http) return of(null);
        return this.http.post(url, payload);
    }

    /**
     * Fluxo completo ao iniciar o cliente:
     * 1. Verifica se o usuário autenticado possui ROLE MASTER.
     * 2. Verifica se a versão atual do cliente já foi catalogada no backend.
     * 3. Se não foi catalogada e usuário for MASTER, dispara a reconciliação.
     */
    public verifyAndReconcileCatalogIfMaster(user: any, staticApps: any[]): Observable<any> {
        if (!user || !user.roles?.includes('MASTER')) {
            return of({ skipped: true, reason: 'Usuário não possui papel MASTER.' });
        }

        const versionHash = GIT_VERSION.shortHash;
        const cacheKey = `ci_reconciled_${versionHash}`;

        if (this.catalogedInSession.has(cacheKey)) {
            return of({ skipped: true, reason: 'Versão já reconciliada nesta sessão.' });
        }

        return new Observable(observer => {
            this.checkVersionCataloged(versionHash).subscribe({
                next: (checkResult) => {
                    if (checkResult?.isCataloged) {
                        this.catalogedInSession.add(cacheKey);
                        observer.next({ skipped: true, reason: 'Versão já catalogada no backend.' });
                        observer.complete();
                        return;
                    }

                    // Versão ainda não catalogada: executa reconciliação como MASTER
                    this.reconcileCatalog(staticApps, GIT_VERSION).subscribe({
                        next: (reconcileResult) => {
                            this.catalogedInSession.add(cacheKey);
                            if (typeof localStorage !== 'undefined') {
                                try {
                                    localStorage.setItem(cacheKey, '1');
                                } catch {}
                            }
                            observer.next(reconcileResult);
                            observer.complete();
                        },
                        error: (err) => {
                            console.warn('[ApplicationCatalog] Erro ao reconciliar catálogo:', err?.message || err);
                            observer.error(err);
                        }
                    });
                },
                error: (err) => {
                    console.warn('[ApplicationCatalog] Erro ao verificar versão:', err?.message || err);
                    observer.error(err);
                }
            });
        });
    }

    /**
     * Catalogação automática pontual quando uma aplicação é executada.
     */
    public catalogOnFirstExecution(app: Partial<ICatalogAppPayload>): Observable<any> {
        const appKey = app.appKey || (app.routePath ? app.routePath.replace(/^\//, '') : null);
        if (!appKey) return of(null);

        const gitHash = GIT_VERSION.shortHash;
        const cacheKey = `ci_cat_${appKey}_${gitHash}`;

        if (this.catalogedInSession.has(cacheKey)) {
            return of(true);
        }

        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(cacheKey);
            if (stored === '1') {
                this.catalogedInSession.add(cacheKey);
                return of(true);
            }
        }

        const payload: ICatalogAppPayload = {
            appKey,
            routePath: app.routePath || `/${appKey}`,
            name: app.name || appKey,
            description: app.description || undefined,
            icon: app.icon || undefined,
            categoria: app.categoria || 'System',
            roles: app.roles || undefined,
            gitVersionHash: gitHash,
            collaborators: GIT_VERSION.collaborators,
            contextPolicies: app.contextPolicies || undefined
        };

        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/Catalog`;

        if (!this.http) {
            return of(null);
        }

        return new Observable(observer => {
            this.http!.post(url, payload).subscribe({
                next: (res) => {
                    this.catalogedInSession.add(cacheKey);
                    if (typeof localStorage !== 'undefined') {
                        try {
                            localStorage.setItem(cacheKey, '1');
                        } catch {}
                    }
                    observer.next(res);
                    observer.complete();
                },
                error: (err) => {
                    console.warn(`[ApplicationCatalog] Falha ao catalogar ${appKey}:`, err?.message || err);
                    observer.error(err);
                }
            });
        });
    }

    /**
     * Valida se a aplicação pode ser carregada no contexto atual do tenant/usuário.
     */
    public canLoadApp(appKey: string, tenantId?: string): Observable<{ canLoad: boolean; reason?: string; app?: any }> {
        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/CanLoad`;
        if (!this.http) {
            return of({ canLoad: true });
        }
        return this.http.post<{ canLoad: boolean; reason?: string; app?: any }>(url, {
            appKey,
            tenantId
        });
    }

    /**
     * Obtém as aplicações da Loja com status de ativação da conta.
     */
    public getStore(search?: string, categoria?: string): Observable<any[]> {
        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/Store`;
        if (!this.http) return of([]);
        return this.http.post<any[]>(url, { search, categoria });
    }

    /**
     * Ativa ou desativa uma aplicação para a conta do usuário.
     */
    public toggleActivation(appKeyOrId: string, active?: boolean): Observable<any> {
        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/ToggleActivation`;
        if (!this.http) return of(null);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appKeyOrId);
        const payload = isUuid ? { applicationId: appKeyOrId, active } : { appKey: appKeyOrId, active };
        return this.http.post(url, payload);
    }

    /**
     * Lista de chaves de aplicações ativadas para o usuário logado.
     */
    public getMyActivations(): Observable<string[]> {
        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/MyActivations`;
        if (!this.http) return of([]);
        return this.http.post<string[]>(url, {});
    }

    /**
     * Alternar status global de uma aplicação (Ativar/Desativar na plataforma).
     * Requer que o usuário seja MASTER + DEVELOPER e conste nos colaboradores da aplicação.
     */
    public toggleGlobalStatus(appKeyOrId: string, active?: boolean): Observable<any> {
        const rootApi = this.config?.rootApi || 'https://apps.ci.dev.br';
        const url = `${rootApi}/Application/ToggleGlobalStatus`;
        if (!this.http) return of(null);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appKeyOrId);
        const payload = isUuid ? { applicationId: appKeyOrId, active } : { appKey: appKeyOrId, active };
        return this.http.post(url, payload);
    }

    /**
     * Atualiza o cache e o observable de aplicações ativadas para o usuário.
     */
    public refreshMyActivations(): Observable<string[]> {
        return new Observable(observer => {
            this.getMyActivations().subscribe({
                next: (keys) => {
                    const set = new Set<string>(keys || []);
                    this._activatedApps$.next(set);
                    if (typeof localStorage !== 'undefined') {
                        try {
                            localStorage.setItem('ci_my_activated_apps', JSON.stringify(keys));
                        } catch {}
                    }
                    observer.next(keys);
                    observer.complete();
                },
                error: (err) => {
                    if (typeof localStorage !== 'undefined') {
                        try {
                            const cached = localStorage.getItem('ci_my_activated_apps');
                            if (cached) {
                                const parsed = JSON.parse(cached);
                                this._activatedApps$.next(new Set<string>(parsed));
                            }
                        } catch {}
                    }
                    observer.error(err);
                }
            });
        });
    }

    /**
     * Abre o modal com a mini documentação da aplicação.
     */
    public showDocumentation(doc: IAppDocumentation) {
        if (!this.dialog) {
            console.log('[ApplicationCatalog] Mini documentação:', doc);
            return null;
        }
        return this.dialog.open(AppDocDialogComponent, {
            data: doc,
            width: '580px',
            maxWidth: '92vw',
            panelClass: 'ci-app-doc-dialog-panel'
        });
    }

    /**
     * Exibe a mini documentação no primeiro acesso do usuário após ativação.
     */
    public checkAndShowFirstAccessDoc(appKey: string, doc: IAppDocumentation, userId?: string) {
        if (!appKey || !doc) return;
        const key = `ci_seen_doc_${appKey}_${userId || 'default'}`;
        if (typeof localStorage !== 'undefined') {
            const seen = localStorage.getItem(key);
            if (!seen) {
                const ref = this.showDocumentation(doc);
                if (ref) {
                    ref.afterClosed().subscribe(() => {
                        try {
                            localStorage.setItem(key, '1');
                        } catch {}
                    });
                } else {
                    try {
                        localStorage.setItem(key, '1');
                    } catch {}
                }
            }
        }
    }
}
