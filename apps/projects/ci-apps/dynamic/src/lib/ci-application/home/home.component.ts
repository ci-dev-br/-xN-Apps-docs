import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarContextAction, NavbarService } from '@ci/components';
import { EditarDetailComponent } from '@ci/components/editar-detail';
import { Application, ApplicationService, Block, BlockService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { BlocksBuilderComponent } from '../../blocks-builder/blocks-builder.component';
import {
    DynamicBlockNode,
    DynamicBlockSpecification,
    DynamicComponentDefinition,
} from '../../blocks-builder/blocks-builder.models';
import { DYNAMIC_DEFAULT_COMPONENTS } from '../../blocks-builder/default-components';
import { DYNAMIC_PREVIEW_STORAGE_KEY } from '../../component-preview/component-preview.component';
import { BlockHistoryDialogComponent } from '../../block-history/block-history-dialog.component';

/**
 * Tela principal do módulo Dynamic (/Dynamic).
 * Gerencia aplicações, suas rotas em JSON (`Application.blocksContent`) e
 * telas construídas em blocos (`Block`), integradas ao `BlocksBuilderComponent`.
 */
@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
        MatTooltipModule,
        BlocksBuilderComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
    protected applications: Application[] = [];
    protected blocks: Block[] = [];
    protected selectedApplicationId: string | null = null;
    protected activeBlock: Block | null = null;
    protected loading = false;
    protected saving = false;

    /** Lista de componentes e seus inputs disponíveis para o construtor de blocos */
    protected availableComponents: DynamicComponentDefinition[] = DYNAMIC_DEFAULT_COMPONENTS;

    /** Especificação JSON atual em edição no construtor */
    protected currentSpec: DynamicBlockSpecification = this.createDefaultSpec();

    constructor(
        @Optional() private dialog?: MatDialog,
        @Optional() private applicationService?: ApplicationService,
        @Optional() private blockService?: BlockService,
        @Optional() private snackBar?: MatSnackBar,
        @Optional() private navbarService?: NavbarService,
        @Optional() private router?: Router,
        @Optional() private route?: ActivatedRoute,
    ) { }

    async ngOnInit(): Promise<void> {
        this.registrarAcoesNavbar();
        await this.carregarDados();
    }

    ngOnDestroy(): void {
        this.navbarService?.clearContextActions();
    }

    async carregarDados(): Promise<void> {
        this.loading = true;
        try {
            const [appsRes, blocksRes] = await Promise.all([
                this.applicationService
                    ? lastValueFrom(this.applicationService.getList({ body: {} })).catch(() => [])
                    : Promise.resolve([]),
                this.blockService
                    ? lastValueFrom(this.blockService.getList({ body: { take: 100 } })).catch(() => [])
                    : Promise.resolve([]),
            ]);

            this.applications = Array.isArray(appsRes) ? appsRes : [];
            const rawBlocks = Array.isArray(blocksRes)
                ? blocksRes
                : (blocksRes && Array.isArray((blocksRes as any).data) ? (blocksRes as any).data : []);
            this.blocks = rawBlocks;

            if (!this.selectedApplicationId && this.applications.length > 0) {
                this.selectedApplicationId = this.applications[0].id || null;
            }
            this.registrarAcoesNavbar();
        } finally {
            this.loading = false;
        }
    }

    private registrarAcoesNavbar(): void {
        if (!this.navbarService) return;
        const actions: NavbarContextAction[] = [
            {
                id: 'dynamic-app-select',
                label: 'Aplicação Relacionada',
                variant: 'select',
                value: () => this.selectedApplicationId,
                options: () => [
                    { label: 'Todas / Independente', value: null },
                    ...this.applications.map(app => ({
                        label: `${app.name || app.appKey || app.routePath} (${app.routePath || '/'})`,
                        value: app.id,
                    })),
                ],
                onChange: (val: string | null) => {
                    this.selectedApplicationId = val;
                },
            },
            {
                id: 'dynamic-nova-tela',
                label: 'Nova Tela',
                icon: 'add',
                variant: 'stroked',
                tooltip: 'Criar uma nova tela em blocos',
                onClick: () => this.novaTela(),
            },
            {
                id: 'dynamic-salvar-tela',
                label: 'Salvar Tela',
                icon: 'save',
                variant: 'flat',
                color: 'primary',
                tooltip: 'Salvar tela atual em blocos',
                disabled: () => this.saving,
                onClick: () => this.salvarBloco(this.currentSpec),
            },
            {
                id: 'dynamic-historico',
                label: 'Histórico',
                icon: 'history',
                variant: 'stroked',
                tooltip: 'Visualizar versões anteriores (Snapshots) do bloco',
                disabled: () => !this.activeBlock?.internalId,
                onClick: () => this.abrirHistorico(),
            },
            {
                id: 'dynamic-sincronizar-app',
                label: 'Sincronizar na Aplicação',
                icon: 'sync',
                variant: 'stroked',
                color: 'primary',
                tooltip: 'Grava o mapa JSON de rotas e blocos em Application.blocksContent',
                disabled: () => !this.selectedApplicationId || this.saving,
                onClick: () => this.sincronizarNaAplicacao(),
            },
            {
                id: 'dynamic-nova-aplicacao',
                label: 'Nova Aplicação',
                icon: 'apps',
                variant: 'raised',
                color: 'primary',
                tooltip: 'Cadastrar nova aplicação',
                onClick: () => this.novo(),
            },
        ];
        this.navbarService.setContextActions(actions, 'Dynamic XD');
    }

    get selectedApplication(): Application | undefined {
        return this.applications.find(a => a.id === this.selectedApplicationId);
    }

    get filteredBlocks(): Block[] {
        if (!this.selectedApplicationId) return this.blocks;
        return this.blocks.filter(
            b => !b.applicationId || b.applicationId === this.selectedApplicationId
        );
    }

    async novo(): Promise<void> {
        const new_application = {};
        this.dialog?.open(EditarDetailComponent, {
            data: {
                schemaName: 'Application',
                new_application,
            },
        });
    }

    novaTela(): void {
        this.activeBlock = null;
        const appRoute = this.selectedApplication?.routePath || '';
        this.currentSpec = {
            version: '1.0.0',
            name: 'Nova Tela',
            route: appRoute ? `${appRoute}/nova-tela` : '/nova-tela',
            layout: 'vertical',
            blocks: [],
            metadata: {},
        };
    }

    selecionarBloco(block: Block): void {
        this.activeBlock = block;
        if (block.applicationId) {
            this.selectedApplicationId = block.applicationId;
        }
        const code = (block.code || {}) as Partial<DynamicBlockSpecification>;
        this.currentSpec = {
            version: code.version || '1.0.0',
            name: block.name || code.name || 'Tela sem nome',
            route: block.route || code.route || '',
            layout: code.layout || 'vertical',
            blocks: Array.isArray(code.blocks) ? JSON.parse(JSON.stringify(code.blocks)) : [],
            metadata: code.metadata || {},
        };
    }

    async salvarBloco(spec: DynamicBlockSpecification): Promise<void> {
        if (!this.blockService) {
            this.notify('Serviço de blocos indisponível no momento.');
            return;
        }

        this.saving = true;
        try {
            const payload: Block = {
                ...(this.activeBlock || {}),
                name: spec.name || 'Nova Tela',
                lang: 'dynamic-blocks-json',
                route: spec.route || '',
                applicationId: this.selectedApplicationId || this.activeBlock?.applicationId || null,
                code: {
                    ...spec,
                    version: spec.version || '1.0.0',
                    name: spec.name || 'Nova Tela',
                },
            };

            const res = await lastValueFrom(
                this.blockService.sync({ body: { data: payload } })
            );
            const saved = (res as any)?.data || res || payload;
            this.activeBlock = saved;

            const idx = this.blocks.findIndex(b => b.internalId && b.internalId === saved.internalId);
            if (idx >= 0) {
                this.blocks[idx] = saved;
            } else {
                this.blocks = [saved, ...this.blocks];
            }

            this.notify('Tela em blocos salva com sucesso!');
        } catch {
            this.notify('Não foi possível salvar a tela em blocos.');
        } finally {
            this.saving = false;
        }
    }

    async excluirBloco(block: Block, event: Event): Promise<void> {
        event.stopPropagation();
        if (!this.blockService || !block.internalId) return;

        try {
            await lastValueFrom(this.blockService.delete({ body: block }));
            this.blocks = this.blocks.filter(b => b.internalId !== block.internalId);
            if (this.activeBlock?.internalId === block.internalId) {
                this.novaTela();
            }
            this.notify('Bloco removido.');
        } catch {
            this.notify('Erro ao remover bloco.');
        }
    }

    async sincronizarNaAplicacao(): Promise<void> {
        const app = this.selectedApplication;
        if (!this.applicationService || !app?.id) {
            this.notify('Selecione uma aplicação válida para sincronizar.');
            return;
        }

        const appBlocks = this.blocks.filter(b => b.applicationId === app.id);
        const blocksContent = {
            updatedAt: new Date().toISOString(),
            routes: appBlocks.map(b => ({
                blockInternalId: b.internalId,
                name: b.name,
                route: b.route,
                code: b.code,
            })),
        };

        this.saving = true;
        try {
            const updated = await lastValueFrom(
                this.applicationService.sync({
                    body: {
                        data: {
                            ...app,
                            blocksContent,
                        },
                    },
                })
            );
            const idx = this.applications.findIndex(a => a.id === updated.id);
            if (idx >= 0) {
                this.applications[idx] = updated;
            }
            this.notify('Conteúdo em blocos sincronizado na aplicação!');
        } catch {
            this.notify('Permissão insuficiente ou erro ao atualizar Application.');
        } finally {
            this.saving = false;
        }
    }

    abrirHistorico(): void {
        if (!this.dialog || !this.activeBlock?.internalId) return;
        const ref = this.dialog.open(BlockHistoryDialogComponent, {
            width: '980px',
            maxWidth: '95vw',
            data: {
                block: this.activeBlock,
                currentSpec: this.currentSpec,
            },
        });
        ref.afterClosed().subscribe((restoredSpec?: DynamicBlockSpecification) => {
            if (restoredSpec && typeof restoredSpec === 'object') {
                this.currentSpec = {
                    version: restoredSpec.version || '1.0.0',
                    name: restoredSpec.name || this.currentSpec.name || 'Tela Restaurada',
                    route: restoredSpec.route ?? this.currentSpec.route ?? '',
                    layout: restoredSpec.layout || 'vertical',
                    blocks: Array.isArray(restoredSpec.blocks)
                        ? JSON.parse(JSON.stringify(restoredSpec.blocks))
                        : [],
                    metadata: restoredSpec.metadata || {},
                };
                this.notify('Versão restaurada no construtor. Clique em "Salvar Tela" para confirmar.');
            }
        });
    }

    abrirPreviewComponente(block: DynamicBlockNode): void {
        if (typeof sessionStorage !== 'undefined') {
            try {
                sessionStorage.setItem(DYNAMIC_PREVIEW_STORAGE_KEY, JSON.stringify(block));
            } catch { }
        }
        if (this.router && this.route) {
            this.router.navigate(['preview'], {
                relativeTo: this.route,
                state: { block },
            });
        } else {
            this.router?.navigate(['/Dynamic/preview'], { state: { block } });
        }
    }

    private createDefaultSpec(): DynamicBlockSpecification {
        return {
            version: '1.0.0',
            name: 'Nova Tela',
            route: '/nova-tela',
            layout: 'vertical',
            blocks: [],
            metadata: {},
        };
    }

    private notify(message: string): void {
        this.snackBar?.open(message, 'Fechar', { duration: 3500 });
    }
}
