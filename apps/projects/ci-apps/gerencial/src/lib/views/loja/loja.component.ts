import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApplicationCatalogService, APP_DOCUMENTATION_REGISTRY, IAppDocumentation } from '@ci/core';
import { UserAuthenticationService } from '@ci/auth';

export interface IStoreApp {
    id?: string;
    appKey: string;
    name: string;
    description?: string;
    icon?: string;
    categoria?: string;
    routePath?: string;
    isActivated?: boolean;
    isActive?: boolean;
    isCollaborator?: boolean;
    canToggleGlobal?: boolean;
    canActivate?: boolean;
    roleRestricted?: boolean;
    roles?: string[];
    collaborators?: string[];
    loading?: boolean;
    globalLoading?: boolean;
}

@Component({
    selector: 'ci-loja',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        RouterModule
    ],
    templateUrl: './loja.component.html',
    styleUrls: ['./loja.component.scss']
})
export class LojaComponent implements OnInit {
    apps: IStoreApp[] = [];
    filteredApps: IStoreApp[] = [];
    isLoading = false;

    searchControl = new FormControl('');
    categories: string[] = ['Todas', 'Gestão', 'Produtividade', 'Desenvolvimento', 'Comunicação', 'Vendas', 'Design', 'Administração', 'Geral'];
    selectedCategory = 'Todas';

    constructor(
        private readonly catalogService: ApplicationCatalogService,
        @Optional() private readonly userService?: UserAuthenticationService,
        @Optional() private readonly snackBar?: MatSnackBar,
        @Optional() private readonly router?: Router,
        private readonly cdr?: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadStoreApps();

        this.searchControl.valueChanges.pipe(
            debounceTime(250),
            distinctUntilChanged()
        ).subscribe(() => {
            this.applyFilters();
        });
    }

    loadStoreApps(): void {
        this.isLoading = true;
        const currentUser = this.userService?.user?.value;
        const isGoodness = currentUser?.roles?.includes('GOODNESS');

        this.catalogService.getStore().subscribe({
            next: (data) => {
                if (data && data.length > 0) {
                    this.apps = data.map(item => {
                        const isCollab = Boolean(item.isCollaborator);
                        const canToggleGlobal = Boolean(item.canToggleGlobal);
                        let canActivate = Boolean(item.canActivate);

                        if (isGoodness || isCollab) {
                            canActivate = true;
                        }

                        return {
                            id: item.id,
                            appKey: item.appKey || item.routePath?.replace(/^\//, '') || item.name,
                            name: item.name || item.appKey,
                            description: item.description,
                            icon: item.icon || 'apps',
                            categoria: item.categoria || 'Geral',
                            routePath: item.routePath || `/${item.appKey}`,
                            isActivated: Boolean(item.isActivated),
                            isActive: item.isActive !== false,
                            isCollaborator: isCollab,
                            canToggleGlobal,
                            canActivate,
                            roleRestricted: Boolean(item.roleRestricted),
                            roles: item.roles,
                            collaborators: item.collaborators
                        };
                    });
                } else {
                    // Fallback para as documentações conhecidas caso a API retorne vazio
                    this.apps = Object.values(APP_DOCUMENTATION_REGISTRY).map(doc => ({
                        appKey: doc.appKey || doc.title,
                        name: doc.title,
                        description: doc.summary,
                        icon: doc.icon || 'apps',
                        categoria: doc.category || 'Geral',
                        routePath: `/${doc.appKey || doc.title}`,
                        isActivated: false,
                        isActive: true,
                        canActivate: true
                    }));
                }
                this.applyFilters();
                this.isLoading = false;
                this.cdr?.markForCheck();
            },
            error: (err) => {
                console.warn('[Loja] Erro ao carregar catálogo da Loja:', err);
                this.apps = Object.values(APP_DOCUMENTATION_REGISTRY).map(doc => ({
                    appKey: doc.appKey || doc.title,
                    name: doc.title,
                    description: doc.summary,
                    icon: doc.icon || 'apps',
                    categoria: doc.category || 'Geral',
                    routePath: `/${doc.appKey || doc.title}`,
                    isActivated: false,
                    isActive: true,
                    canActivate: true
                }));
                this.applyFilters();
                this.isLoading = false;
                this.cdr?.markForCheck();
            }
        });
    }

    selectCategory(cat: string): void {
        this.selectedCategory = cat;
        this.applyFilters();
    }

    applyFilters(): void {
        const query = (this.searchControl.value || '').trim().toLowerCase();
        this.filteredApps = this.apps.filter(app => {
            const matchesCat = this.selectedCategory === 'Todas' ||
                (app.categoria && app.categoria.toLowerCase() === this.selectedCategory.toLowerCase());

            const matchesQuery = !query ||
                app.name.toLowerCase().includes(query) ||
                (app.description && app.description.toLowerCase().includes(query)) ||
                (app.appKey && app.appKey.toLowerCase().includes(query));

            return matchesCat && matchesQuery;
        });
    }

    /**
     * Alterna o estado de ativação da aplicação para a conta do usuário.
     * Quando ativado, exibe imediatamente a mini documentação vinculada aos metadados.
     */
    toggleActivation(app: IStoreApp): void {
        if (!app.canActivate) {
            this.snackBar?.open(`Esta aplicação exige papel específico (${app.roles?.join(', ')}) para ativação.`, 'Fechar', { duration: 3500 });
            return;
        }

        app.loading = true;
        const targetState = !app.isActivated;

        this.catalogService.toggleActivation(app.appKey, targetState).subscribe({
            next: (res) => {
                app.isActivated = targetState;
                app.loading = false;

                // Atualiza cache de aplicações ativadas para reflexo imediato em 'meus-apps'
                this.catalogService.refreshMyActivations().subscribe();

                if (targetState) {
                    this.snackBar?.open(`Aplicação "${app.name}" ativada na sua conta com sucesso!`, 'OK', {
                        duration: 3500,
                        horizontalPosition: 'end',
                        verticalPosition: 'bottom'
                    });

                    // Exibe automaticamente a mini documentação ao ativar
                    this.openDocumentation(app);
                } else {
                    this.snackBar?.open(`Aplicação "${app.name}" desativada.`, 'OK', {
                        duration: 2500,
                        horizontalPosition: 'end',
                        verticalPosition: 'bottom'
                    });
                }
                this.cdr?.markForCheck();
            },
            error: (err) => {
                app.loading = false;
                const errorMsg = err?.error?.message || `Não foi possível ativar a aplicação.`;
                this.snackBar?.open(errorMsg, 'Fechar', { duration: 4000 });
                this.cdr?.markForCheck();
            }
        });
    }

    /**
     * Alterna o status global da aplicação (MASTER + DEVELOPER + Colaborador).
     */
    toggleGlobalStatus(app: IStoreApp): void {
        if (!app.canToggleGlobal) return;
        app.globalLoading = true;
        const targetGlobal = !app.isActive;

        this.catalogService.toggleGlobalStatus(app.appKey, targetGlobal).subscribe({
            next: (res) => {
                app.isActive = targetGlobal;
                app.globalLoading = false;
                this.snackBar?.open(
                    targetGlobal
                        ? `Aplicação "${app.name}" agora está disponível globalmente para os usuários.`
                        : `Aplicação "${app.name}" desativada globalmente.`,
                    'OK',
                    { duration: 4000 }
                );
                this.cdr?.markForCheck();
            },
            error: (err) => {
                app.globalLoading = false;
                this.snackBar?.open(err?.error?.message || 'Falha ao alterar status global da aplicação.', 'Fechar', { duration: 4000 });
                this.cdr?.markForCheck();
            }
        });
    }

    /**
     * Abre a mini documentação da aplicação a partir dos metadados de rota.
     */
    openDocumentation(app: IStoreApp): void {
        const doc: IAppDocumentation = APP_DOCUMENTATION_REGISTRY[app.appKey] || {
            appKey: app.appKey,
            title: app.name,
            summary: app.description || 'Aplicação pronta para uso na plataforma corporativa.',
            category: app.categoria,
            icon: app.icon || 'apps',
            features: [
                'Interface integrada com a plataforma',
                'Segurança e controle de permissões centralizado',
                'Alta produtividade e sincronização em nuvem'
            ],
            quickStart: [
                'Clique em "Abrir Aplicação" para acessar o painel.',
                'Utilize os recursos disponíveis no menu lateral e superior.',
                'Em caso de dúvidas, consulte este guia a qualquer momento na Loja.'
            ]
        };

        this.catalogService.showDocumentation(doc);
    }

    /**
     * Navega para a aplicação.
     */
    openApp(app: IStoreApp): void {
        const route = app.routePath ? `/painel${app.routePath.startsWith('/') ? '' : '/'}${app.routePath}` : `/painel/${app.appKey}`;
        this.router?.navigate([route]);
    }
}
