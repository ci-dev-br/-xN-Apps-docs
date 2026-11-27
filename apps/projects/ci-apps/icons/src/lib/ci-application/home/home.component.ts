import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconLoaderSerices } from '@ci/core';
import { IconModule, NavbarService } from '@ci/components';
import { ActionModule } from '@ci/components/action';
import {
    WorkspaceIconItemDto,
    WorkspaceIconPackDto,
} from '@ci/portal-api';
import {
    DiscoveredActionTarget,
    DiscoveredAppTarget,
    IconsStudioService,
} from '../../icons.service';
import {
    createStarterTemplate,
    sanitizeSvgString,
    SvgArtboardBg,
    SvgTemplateId,
} from '../../models/svg-editor.model';
import { SvgEditorComponent } from '../../views/svg-editor/svg-editor.component';

type StudioTab = 'catalog' | 'editor' | 'links';

@Component({
    selector: 'ci-home',
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        IconModule,
        ActionModule,
        SvgEditorComponent,
    ],
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
    @ViewChild('batchSvgInput') batchSvgInputRef?: ElementRef<HTMLInputElement>;
    @ViewChild('packDialog') packDialogRef?: ElementRef<HTMLDialogElement>;
    @ViewChild('newIconDialog') newIconDialogRef?: ElementRef<HTMLDialogElement>;

    activeTab: StudioTab = 'catalog';
    loading = false;
    saving = false;
    fromServer = false;
    statusMessage = '';
    private statusTimer: any = null;

    packs: WorkspaceIconPackDto[] = [];
    selectedPackCode = 'v2';
    selectedIcon?: WorkspaceIconItemDto;

    // Filtros do catálogo
    searchTerm = '';
    usageFilter: 'all' | 'app' | 'action' | 'ui' = 'all';
    previewSize = 40;
    previewBg: SvgArtboardBg = 'checker';

    // Formulário de edição do ícone ativo
    editingForm = {
        code: 'novo-icone',
        previousCode: '',
        name: 'Novo Ícone',
        description: '',
        packCode: 'v2',
        category: 'App',
        usageType: 'app',
        tagsText: '',
        viewBox: '0 0 160 160',
    };
    editingSvg = createStarterTemplate('app-badge', '0 0 160 160');

    // Formulário de Pacote (Modal)
    packForm = {
        isEdit: false,
        previousCode: '',
        code: '',
        name: '',
        version: '1.0.0',
        description: '',
        isActive: true,
        isDefault: false,
        targetAppsText: '',
    };

    // Formulário de Novo Ícone (Modal)
    newIconForm: {
        code: string;
        name: string;
        packCode: string;
        usageType: 'app' | 'action' | 'both' | 'ui';
        viewBox: string;
        template: SvgTemplateId;
    } = {
            code: 'meu-icone',
            name: 'Meu Ícone',
            packCode: 'v2',
            usageType: 'app',
            viewBox: '0 0 160 160',
            template: 'app-badge',
        };

    // Apps & Ações Vinculadas
    availableApps: DiscoveredAppTarget[] = [];
    availableActions: DiscoveredActionTarget[] = [];
    appSearchTerm = '';
    actionSearchTerm = '';
    customActionInput = '';
    selectedLinkedApps = new Set<string>();
    selectedLinkedActions = new Set<string>();
    updateAppEntityIcon = true;

    readonly iconTemplates: Array<{ id: SvgTemplateId; label: string }> = [
        { id: 'app-badge', label: 'Badge de App' },
        { id: 'action-bolt', label: 'Ação Rápida (Raio)' },
        { id: 'action-gear', label: 'Ação Config (Engrenagem)' },
        { id: 'document', label: 'Documento' },
        { id: 'star', label: 'Estrela / Destaque' },
        { id: 'blank', label: 'Canvas em Branco' },
    ];

    constructor(
        private readonly iconsStudio: IconsStudioService,
        private readonly sanitizer: DomSanitizer,
        @Optional() private readonly navbarService?: NavbarService,
        @Optional() private readonly iconLoader?: IconLoaderSerices,
    ) {
        if (this.iconLoader && !this.iconLoader.registeredIcons()['icones']) {
            this.iconLoader.registerSvgLiteral('icones', createStarterTemplate('app-badge', '0 0 160 160'));
        }
    }

    async ngOnInit() {
        this.registerNavbarActions();
        await Promise.all([
            this.refreshPacks(),
            this.loadTargets(),
        ]);
    }

    ngOnDestroy(): void {
        this.navbarService?.clearContextActions();
        clearTimeout(this.statusTimer);
    }

    private registerNavbarActions() {
        this.navbarService?.setContextActions([
            {
                id: 'icons-new-icon',
                label: 'Novo Ícone',
                icon: 'add_circle',
                variant: 'flat',
                color: 'primary',
                onClick: () => this.openNewIconDialog(),
            },
            {
                id: 'icons-new-pack',
                label: 'Novo Pacote',
                icon: 'create_new_folder',
                variant: 'stroked',
                onClick: () => this.openPackDialog(false),
            },
            {
                id: 'icons-import-svg',
                label: 'Importar .SVG',
                icon: 'upload_file',
                variant: 'stroked',
                onClick: () => this.triggerBatchImport(),
            },
            {
                id: 'icons-save',
                label: 'Salvar Ícone',
                icon: 'save',
                variant: 'raised',
                color: 'primary',
                disabled: () => this.saving,
                onClick: () => this.saveCurrentIcon(),
            },
        ], 'Icons Studio');
    }

    async refreshPacks() {
        this.loading = true;
        try {
            const res = await this.iconsStudio.loadPacks();
            this.packs = res.packs;
            this.fromServer = res.fromServer;
            if (!this.packs.some(p => p.code === this.selectedPackCode) && this.packs.length > 0) {
                this.selectedPackCode = this.packs[0].code;
            }
            const currentPack = this.activePack;
            if (currentPack?.icons?.length && !this.selectedIcon) {
                this.selectIcon(currentPack.icons[0], false);
            }
        } finally {
            this.loading = false;
        }
    }

    async loadTargets() {
        const [apps, actions] = await Promise.all([
            this.iconsStudio.discoverAvailableApps(),
            this.iconsStudio.discoverAvailableActions(),
        ]);
        this.availableApps = apps;
        this.availableActions = actions;
    }

    get activePack(): WorkspaceIconPackDto | undefined {
        return this.packs.find(p => p.code === this.selectedPackCode) || this.packs[0];
    }

    get filteredIcons(): WorkspaceIconItemDto[] {
        const list = this.activePack?.icons || [];
        const q = this.searchTerm.trim().toLowerCase();
        return list.filter(item => {
            if (this.usageFilter !== 'all') {
                const ut = (item.usageType || 'app').toLowerCase();
                if (this.usageFilter === 'app' && ut !== 'app' && ut !== 'both') return false;
                if (this.usageFilter === 'action' && ut !== 'action' && ut !== 'both') return false;
                if (this.usageFilter === 'ui' && ut !== 'ui') return false;
            }
            if (!q) return true;
            const hay = [
                item.code,
                item.name,
                item.description,
                item.category,
                ...(item.tags || []),
                ...(item.linkedApps || []),
                ...(item.linkedActions || []),
            ].filter(Boolean).join(' ').toLowerCase();
            return hay.includes(q);
        });
    }

    get filteredApps(): DiscoveredAppTarget[] {
        const q = this.appSearchTerm.trim().toLowerCase();
        if (!q) return this.availableApps;
        return this.availableApps.filter(a =>
            a.name.toLowerCase().includes(q) || a.appKey.toLowerCase().includes(q)
        );
    }

    get filteredActions(): DiscoveredActionTarget[] {
        const q = this.actionSearchTerm.trim().toLowerCase();
        const extraCustom: DiscoveredActionTarget[] = [];
        for (const id of this.selectedLinkedActions) {
            if (!this.availableActions.some(a => a.actionId === id)) {
                extraCustom.push({
                    actionId: id,
                    label: id,
                    source: 'Ação Personalizada',
                });
            }
        }
        const all = [...extraCustom, ...this.availableActions];
        if (!q) return all;
        return all.filter(a =>
            a.actionId.toLowerCase().includes(q) ||
            a.label.toLowerCase().includes(q) ||
            a.source.toLowerCase().includes(q)
        );
    }

    get previewTrustedSvg(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(sanitizeSvgString(this.editingSvg));
    }

    trustSvg(svgContent?: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(sanitizeSvgString(svgContent || ''));
    }

    selectPack(pack: WorkspaceIconPackDto) {
        this.selectedPackCode = pack.code;
        const first = pack.icons?.[0];
        if (first) {
            this.selectIcon(first, false);
        }
    }

    selectIcon(icon: WorkspaceIconItemDto, switchTab?: StudioTab | false) {
        this.selectedIcon = icon;
        this.editingForm = {
            code: icon.code,
            previousCode: icon.code,
            name: icon.name || icon.code,
            description: icon.description || '',
            packCode: icon.packCode || this.selectedPackCode,
            category: icon.category || 'App',
            usageType: icon.usageType || 'app',
            tagsText: (icon.tags || []).join(', '),
            viewBox: icon.viewBox || '0 0 160 160',
        };
        this.editingSvg = icon.svgContent || createStarterTemplate('app-badge', icon.viewBox || '0 0 160 160');
        this.selectedLinkedApps = new Set(icon.linkedApps || []);
        this.selectedLinkedActions = new Set(icon.linkedActions || []);
        this.iconsStudio.registerIconImmediate(
            icon.code,
            this.editingSvg,
            icon.packCode,
            icon.linkedApps,
            icon.linkedActions
        );
        if (switchTab) {
            this.activeTab = switchTab;
        }
    }

    onEditorSvgChange(newSvg: string) {
        this.editingSvg = newSvg;
    }

    async saveCurrentIcon(svgOverride?: string) {
        const code = (this.editingForm.code || '').trim();
        if (!code) {
            this.announceStatus('Informe o código do ícone antes de salvar.');
            return;
        }
        const svgContent = svgOverride || this.editingSvg;
        this.saving = true;
        try {
            const tags = this.editingForm.tagsText
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            const res = await this.iconsStudio.saveIcon({
                packCode: this.editingForm.packCode || this.selectedPackCode,
                code,
                previousCode: this.editingForm.previousCode || undefined,
                name: this.editingForm.name || code,
                description: this.editingForm.description || undefined,
                svgContent,
                viewBox: this.editingForm.viewBox,
                category: this.editingForm.category,
                usageType: this.editingForm.usageType,
                tags,
                linkedApps: Array.from(this.selectedLinkedApps),
                linkedActions: Array.from(this.selectedLinkedActions),
                writeToAssets: true,
                updateApplicationEntity: this.updateAppEntityIcon,
            });
            this.editingForm.previousCode = res.icon.code;
            this.selectedPackCode = res.icon.packCode;
            await this.refreshPacks();
            const refreshedPack = this.packs.find(p => p.code === res.icon.packCode);
            const refreshedIcon = refreshedPack?.icons?.find(i => i.code === res.icon.code) || res.icon;
            this.selectIcon(refreshedIcon, false);
            this.announceStatus(
                res.fromServer
                    ? `Ícone "${res.icon.code}" salvo no pacote "${res.icon.packCode}" e registrado em runtime.`
                    : `Ícone "${res.icon.code}" salvo em cache local e registrado em runtime.`
            );
        } finally {
            this.saving = false;
        }
    }

    async deleteIconItem(icon: WorkspaceIconItemDto, event?: Event) {
        event?.stopPropagation();
        await this.iconsStudio.deleteIcon(icon.packCode, icon.code);
        if (this.selectedIcon?.code === icon.code && this.selectedIcon?.packCode === icon.packCode) {
            this.selectedIcon = undefined;
        }
        await this.refreshPacks();
        this.announceStatus(`Ícone "${icon.code}" removido do pacote "${icon.packCode}".`);
    }

    // --- Modais nativos <dialog> ---
    openPackDialog(editMode: boolean) {
        const current = this.activePack;
        if (editMode && current) {
            this.packForm = {
                isEdit: true,
                previousCode: current.code,
                code: current.code,
                name: current.name,
                version: current.version || '1.0.0',
                description: current.description || '',
                isActive: current.isActive !== false,
                isDefault: Boolean(current.isDefault),
                targetAppsText: (current.targetApps || []).join(', '),
            };
        } else {
            this.packForm = {
                isEdit: false,
                previousCode: '',
                code: 'custom-pack',
                name: 'Novo Pacote de Ícones',
                version: '1.0.0',
                description: '',
                isActive: true,
                isDefault: false,
                targetAppsText: '',
            };
        }
        const dlg = this.packDialogRef?.nativeElement;
        if (dlg && !dlg.open) {
            dlg.returnValue = '';
            dlg.showModal();
        }
    }

    async submitPackDialog() {
        const code = (this.packForm.code || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-');
        if (!code) return;
        const targetApps = this.packForm.targetAppsText.split(',').map(s => s.trim()).filter(Boolean);
        const res = await this.iconsStudio.savePack({
            code,
            previousCode: this.packForm.previousCode || undefined,
            name: this.packForm.name || code,
            version: this.packForm.version || '1.0.0',
            description: this.packForm.description || undefined,
            isActive: this.packForm.isActive,
            isDefault: this.packForm.isDefault,
            targetApps,
            writeToAssets: true,
        });
        this.closeDialog(this.packDialogRef?.nativeElement);
        this.selectedPackCode = res.pack.code;
        await this.refreshPacks();
        this.announceStatus(`Pacote "${res.pack.name}" salvo com sucesso.`);
    }

    openNewIconDialog() {
        this.newIconForm = {
            code: `icone-${(this.activePack?.icons?.length || 0) + 1}`,
            name: 'Novo Ícone',
            packCode: this.selectedPackCode || 'v2',
            usageType: 'app',
            viewBox: '0 0 160 160',
            template: 'app-badge',
        };
        const dlg = this.newIconDialogRef?.nativeElement;
        if (dlg && !dlg.open) {
            dlg.returnValue = '';
            dlg.showModal();
        }
    }

    createIconFromDialog() {
        const code = (this.newIconForm.code || '').trim();
        if (!code) return;
        const svg = createStarterTemplate(this.newIconForm.template, this.newIconForm.viewBox);
        this.editingForm = {
            code,
            previousCode: '',
            name: this.newIconForm.name || code,
            description: '',
            packCode: this.newIconForm.packCode || this.selectedPackCode,
            category: this.newIconForm.usageType === 'action' ? 'Ação' : 'App',
            usageType: this.newIconForm.usageType,
            tagsText: '',
            viewBox: this.newIconForm.viewBox,
        };
        this.editingSvg = svg;
        this.selectedLinkedApps = new Set();
        this.selectedLinkedActions = new Set();
        this.selectedIcon = {
            code,
            name: this.editingForm.name,
            packCode: this.editingForm.packCode,
            svgContent: svg,
            viewBox: this.editingForm.viewBox,
            usageType: this.editingForm.usageType,
        };
        this.closeDialog(this.newIconDialogRef?.nativeElement);
        this.activeTab = 'editor';
        this.announceStatus(`Novo rascunho "${code}" iniciado no Editor SVG.`);
    }

    closeDialog(dlg?: HTMLDialogElement) {
        if (!dlg) return;
        dlg.returnValue = '';
        if (dlg.open) dlg.close();
    }

    // --- Importação em Lote / Drag & Drop ---
    triggerBatchImport() {
        this.batchSvgInputRef?.nativeElement?.click();
    }

    async onBatchFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input?.files;
        if (!files || files.length === 0) return;
        await this.importSvgFileList(Array.from(files));
        input.value = '';
    }

    async onDropFiles(event: DragEvent) {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return;
        await this.importSvgFileList(Array.from(files));
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    private async importSvgFileList(files: File[]) {
        const svgFiles = files.filter(f => f.name.toLowerCase().endsWith('.svg'));
        if (svgFiles.length === 0) {
            this.announceStatus('Nenhum arquivo .svg encontrado na seleção.');
            return;
        }
        let importedCount = 0;
        for (const file of svgFiles) {
            const text = await file.text();
            const code = file.name.replace(/\.svg$/i, '').trim();
            await this.iconsStudio.saveIcon({
                packCode: this.selectedPackCode || 'v2',
                code,
                name: code,
                svgContent: text,
                usageType: 'app',
                writeToAssets: true,
            });
            importedCount++;
        }
        await this.refreshPacks();
        this.announceStatus(`${importedCount} ícone(s) importado(s) para o pacote "${this.selectedPackCode}".`);
    }

    // --- Apps & Ações Vinculadas ---
    toggleLinkedApp(appKey: string) {
        if (this.selectedLinkedApps.has(appKey)) {
            this.selectedLinkedApps.delete(appKey);
        } else {
            this.selectedLinkedApps.add(appKey);
        }
    }

    toggleLinkedAction(actionId: string) {
        if (this.selectedLinkedActions.has(actionId)) {
            this.selectedLinkedActions.delete(actionId);
        } else {
            this.selectedLinkedActions.add(actionId);
        }
    }

    addCustomActionBinding() {
        const val = this.customActionInput.trim();
        if (!val) return;
        this.selectedLinkedActions.add(val);
        this.customActionInput = '';
    }

    async saveTargetsLink() {
        const code = this.editingForm.code?.trim();
        const packCode = this.editingForm.packCode || this.selectedPackCode;
        if (!code || !packCode) return;

        this.saving = true;
        try {
            const res = await this.iconsStudio.linkTargets({
                packCode,
                code,
                assetPath: this.selectedIcon?.assetPath,
                linkedApps: Array.from(this.selectedLinkedApps),
                linkedActions: Array.from(this.selectedLinkedActions),
                updateApplicationEntity: this.updateAppEntityIcon,
            }, this.editingSvg);

            await this.refreshPacks();
            await this.loadTargets();
            const refreshedPack = this.packs.find(p => p.code === packCode);
            const refreshed = refreshedPack?.icons?.find(i => i.code === code) || res.icon;
            this.selectIcon(refreshed, 'links');
            this.announceStatus(`Vínculos salvos para "${code}" (${this.selectedLinkedApps.size} app(s), ${this.selectedLinkedActions.size} ação(ões)).`);
        } finally {
            this.saving = false;
        }
    }

    exportActivePack() {
        if (!this.activePack) return;
        this.iconsStudio.exportPackAsJsonBundle(this.activePack);
        this.announceStatus(`Pacote "${this.activePack.code}" exportado.`);
    }

    downloadIcon(icon: WorkspaceIconItemDto, event?: Event) {
        event?.stopPropagation();
        if (!icon.svgContent) return;
        this.iconsStudio.downloadSvgFile(icon.code, icon.svgContent);
    }

    async copySnippet(text: string, label: string, event?: Event) {
        event?.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            this.announceStatus(`${label} copiado para a área de transferência.`);
        } catch {
            this.announceStatus(`Falha ao copiar ${label}.`);
        }
    }

    getMatIconSnippet(code?: string): string {
        const c = code || this.editingForm.code || 'icone';
        return `<mat-icon svgIcon="${c}"></mat-icon>`;
    }

    getCiActionSnippet(code?: string): string {
        const c = code || this.editingForm.code || 'icone';
        return `<ci-action icon="${c}" type="svg" label="Executar Ação"></ci-action>`;
    }

    getNavbarActionSnippet(code?: string): string {
        const c = code || this.editingForm.code || 'icone';
        return `{ id: 'custom-action', label: 'Ação', icon: '${c}', iconType: 'svg', variant: 'stroked', onClick: () => {} }`;
    }

    getIconLoaderSnippet(icon?: WorkspaceIconItemDto): string {
        const c = icon?.code || this.editingForm.code || 'icone';
        const p = icon?.assetPath || `icons/${this.editingForm.packCode}/${c}.svg`;
        return `iconLoader.load({ '${c}': { url: '${p}' } });`;
    }

    private announceStatus(msg: string) {
        clearTimeout(this.statusTimer);
        this.statusMessage = msg;
        this.statusTimer = setTimeout(() => {
            this.statusMessage = '';
        }, 4000);
    }
}
