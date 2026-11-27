import { Injectable, Optional } from '@angular/core';
import { Apps, IconLoaderSerices } from '@ci/core';
import {
    Application,
    ApplicationService,
    FileExplorerService,
    IconsService as IconsApiService,
    LinkIconTargetInputDto,
    SaveWorkspaceIconInputDto,
    SaveWorkspacePackInputDto,
    WorkspaceIconItemDto,
    WorkspaceIconPackDto,
} from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { createStarterTemplate, sanitizeSvgString } from './models/svg-editor.model';

export interface DiscoveredAppTarget {
    appKey: string;
    name: string;
    routePath: string;
    currentIcon?: string;
    iconType?: 'svg' | 'mat' | string;
    categoria?: string;
}

export interface DiscoveredActionTarget {
    actionId: string;
    label: string;
    source: string;
    currentIcon?: string;
    description?: string;
}

const LOCAL_PACKS_STORAGE_KEY = 'CI.Icons.LocalPacks.v1';

const FALLBACK_APP_TARGETS: DiscoveredAppTarget[] = [
    { appKey: 'Arquivos', name: 'Arquivos', routePath: '/Arquivos', currentIcon: 'files', iconType: 'svg', categoria: 'System' },
    { appKey: 'Cadastros', name: 'Cadastros', routePath: '/Cadastros', currentIcon: 'cadastros', iconType: 'svg' },
    { appKey: 'Codex', name: 'Codex', routePath: '/Codex', currentIcon: 'codex', iconType: 'svg' },
    { appKey: 'DevTools', name: 'DevTools', routePath: '/DevTools', currentIcon: 'dev-tools', iconType: 'svg' },
    { appKey: 'Dynamic', name: 'Dynamic XD', routePath: '/Dynamic', currentIcon: 'dynamic', iconType: 'svg' },
    { appKey: 'Financeiro', name: 'Financeiro', routePath: '/Financeiro', currentIcon: 'financeiro', iconType: 'svg' },
    { appKey: 'Formularios', name: 'Formularios', routePath: '/Formularios', currentIcon: 'formularios', iconType: 'svg' },
    { appKey: 'Gerencial', name: 'Gerencial', routePath: '/Gerencial', currentIcon: 'gerencial', iconType: 'svg' },
    { appKey: 'Icons', name: 'Icons', routePath: '/Icons', currentIcon: 'icones', iconType: 'svg' },
    { appKey: 'Imersao', name: 'Imersao', routePath: '/Imersao', currentIcon: 'imersao', iconType: 'svg' },
    { appKey: 'Infra', name: 'Infra', routePath: '/Infra', currentIcon: 'infra', iconType: 'svg' },
    { appKey: 'Instalacao', name: 'Instalacao', routePath: '/Installation', currentIcon: 'instalacao', iconType: 'svg' },
    { appKey: 'LowCode', name: 'LowCode', routePath: '/LowCode', currentIcon: 'low-code', iconType: 'svg' },
    { appKey: 'Mensagens', name: 'Mensagens', routePath: '/Mensagens', currentIcon: 'mensagens', iconType: 'svg' },
    { appKey: 'Organizacao', name: 'Organizacao', routePath: '/Organizacao', currentIcon: 'organizacao', iconType: 'svg' },
    { appKey: 'Produtos', name: 'Produtos', routePath: '/Produtos', currentIcon: 'produtos', iconType: 'svg' },
    { appKey: 'Profile', name: 'Profile', routePath: '/Profile', currentIcon: 'perfil', iconType: 'svg' },
    { appKey: 'Projetos', name: 'Projetos', routePath: '/Projetos', currentIcon: 'projetos', iconType: 'svg' },
    { appKey: 'SEO', name: 'SEO', routePath: '/SEO', currentIcon: 'seo', iconType: 'svg' },
    { appKey: 'Threejs', name: 'Threejs', routePath: '/Threejs', currentIcon: 'threejs', iconType: 'svg' },
    { appKey: 'Treinamento', name: 'Treinamento', routePath: '/Treinamento', currentIcon: 'treinamento', iconType: 'svg' },
    { appKey: 'Vendas', name: 'Vendas', routePath: '/Vendas', currentIcon: 'vendas', iconType: 'svg' },
    { appKey: 'CRM', name: 'CRM', routePath: '/CRM', currentIcon: 'crm', iconType: 'svg' },
    { appKey: 'CMS', name: 'CMS', routePath: '/CMS', currentIcon: 'cms', iconType: 'svg' },
    { appKey: 'Estudos', name: 'Estudos', routePath: '/Estudos', currentIcon: 'estudos', iconType: 'svg' },
    { appKey: 'Grupos', name: 'Grupos', routePath: '/Grupos', currentIcon: 'diversity_3', iconType: 'mat' },
    { appKey: 'Loja', name: 'Loja', routePath: '/Loja', currentIcon: 'storefront', iconType: 'mat' },
];

const PRESET_ACTION_TARGETS: DiscoveredActionTarget[] = [
    { actionId: 'navbar:save', label: 'Salvar (Navbar Context)', source: 'NavbarService', description: 'Ação contextual de salvamento na barra superior' },
    { actionId: 'navbar:export', label: 'Exportar (Navbar Context)', source: 'NavbarService', description: 'Ação de exportação de artefatos/pacotes' },
    { actionId: 'navbar:sync', label: 'Sincronizar (Navbar Context)', source: 'NavbarService', description: 'Ação de sincronização com servidor' },
    { actionId: 'action:create', label: 'Novo Registro / Criar', source: 'ci-action / MasterDetail', description: 'Ação padrão de criação de item' },
    { actionId: 'action:edit', label: 'Editar Item', source: 'ci-action / MasterDetail', description: 'Ação padrão de edição' },
    { actionId: 'action:delete', label: 'Excluir Item', source: 'ci-action / MasterDetail', description: 'Ação padrão de exclusão' },
    { actionId: 'event:open:*.svg', label: 'Abrir Vetor SVG', source: 'Route Manifest', description: 'Ação vinculada à abertura de arquivos .svg' },
    { actionId: 'event:open:*', label: 'Abrir Arquivo Genérico', source: 'Route Manifest', description: 'Ação padrão de abertura de arquivos' },
];

@Injectable({
    providedIn: 'root',
})
export class IconsStudioService {
    constructor(
        @Optional() private readonly iconsApi?: IconsApiService,
        @Optional() private readonly applicationApi?: ApplicationService,
        @Optional() private readonly fileExplorer?: FileExplorerService,
        @Optional() private readonly iconLoader?: IconLoaderSerices,
        @Optional() private readonly appsService?: Apps,
    ) { }

    async loadPacks(): Promise<{ packs: WorkspaceIconPackDto[]; fromServer: boolean }> {
        if (this.iconsApi) {
            try {
                const res = await lastValueFrom(this.iconsApi.getWorkspacePacks());
                const packs = res?.packs || [];
                this.registerPackIconsInRuntime(packs);
                this.persistLocalCache(packs);
                return { packs, fromServer: true };
            } catch (err) {
                console.warn('[IconsStudioService] Falha ao consultar servidor, usando cache local:', err);
            }
        }
        const localPacks = this.readLocalCache();
        this.registerPackIconsInRuntime(localPacks);
        return { packs: localPacks, fromServer: false };
    }

    async savePack(input: SaveWorkspacePackInputDto): Promise<{ pack: WorkspaceIconPackDto; fromServer: boolean }> {
        if (this.iconsApi) {
            try {
                const pack = await lastValueFrom(this.iconsApi.savePack({ body: input }));
                return { pack, fromServer: true };
            } catch (err) {
                console.warn('[IconsStudioService] Erro ao salvar pacote no servidor, salvando localmente:', err);
            }
        }
        const packs = this.readLocalCache();
        const existingIdx = packs.findIndex(p => p.code === input.code || (input.previousCode && p.code === input.previousCode));
        const localPack: WorkspaceIconPackDto = {
            code: input.code,
            name: input.name || input.code,
            description: input.description,
            version: input.version || '1.0.0',
            basePath: input.code === 'default' ? 'icons' : `icons/${input.code}`,
            isActive: input.isActive !== false,
            isDefault: Boolean(input.isDefault),
            targetApps: input.targetApps || [],
            linkedActions: input.linkedActions || [],
            source: 'workspace',
            icons: existingIdx > -1 ? (packs[existingIdx].icons || []) : [],
            iconCount: existingIdx > -1 ? (packs[existingIdx].icons?.length || 0) : 0,
        };
        if (existingIdx > -1) packs[existingIdx] = localPack;
        else packs.unshift(localPack);
        this.persistLocalCache(packs);
        return { pack: localPack, fromServer: false };
    }

    async saveIcon(input: SaveWorkspaceIconInputDto): Promise<{ icon: WorkspaceIconItemDto; fromServer: boolean }> {
        const sanitizedSvg = sanitizeSvgString(input.svgContent);
        const payload: SaveWorkspaceIconInputDto = {
            ...input,
            svgContent: sanitizedSvg,
        };

        this.registerIconImmediate(payload.code, sanitizedSvg, payload.packCode, payload.linkedApps, payload.linkedActions);

        if (this.iconsApi) {
            try {
                const saved = await lastValueFrom(this.iconsApi.saveIcon({ body: payload }));
                return { icon: saved, fromServer: true };
            } catch (err) {
                console.warn('[IconsStudioService] Erro ao salvar ícone no servidor, salvando em cache local:', err);
            }
        }

        const packs = this.readLocalCache();
        let pack = packs.find(p => p.code === payload.packCode);
        if (!pack) {
            pack = {
                code: payload.packCode,
                name: payload.packCode,
                version: '1.0.0',
                isActive: true,
                icons: [],
                iconCount: 0,
            };
            packs.push(pack);
        }
        pack.icons = pack.icons || [];
        const localItem: WorkspaceIconItemDto = {
            code: payload.code,
            name: payload.name || payload.code,
            description: payload.description,
            packCode: payload.packCode,
            assetPath: payload.packCode === 'default' ? `icons/${payload.code}.svg` : `icons/${payload.packCode}/${payload.code}.svg`,
            svgContent: sanitizedSvg,
            viewBox: payload.viewBox || '0 0 160 160',
            category: payload.category || 'Custom',
            usageType: payload.usageType || 'app',
            tags: payload.tags || [],
            linkedApps: payload.linkedApps || [],
            linkedActions: payload.linkedActions || [],
            updatedAt: new Date().toISOString(),
            source: 'workspace',
        };
        const idx = pack.icons.findIndex(i => i.code === payload.code || (payload.previousCode && i.code === payload.previousCode));
        if (idx > -1) pack.icons[idx] = localItem;
        else pack.icons.push(localItem);
        pack.iconCount = pack.icons.length;
        this.persistLocalCache(packs);
        return { icon: localItem, fromServer: false };
    }

    async deleteIcon(packCode: string, code: string): Promise<boolean> {
        if (this.iconsApi) {
            try {
                await lastValueFrom(this.iconsApi.deleteIcon({
                    body: { packCode, code, deleteAssetFile: true }
                }));
                return true;
            } catch (err) {
                console.warn('[IconsStudioService] Erro ao excluir ícone no servidor:', err);
            }
        }
        const packs = this.readLocalCache();
        const pack = packs.find(p => p.code === packCode);
        if (pack?.icons) {
            pack.icons = pack.icons.filter(i => i.code !== code);
            pack.iconCount = pack.icons.length;
            this.persistLocalCache(packs);
        }
        return false;
    }

    async linkTargets(input: LinkIconTargetInputDto, svgContent?: string): Promise<{ icon: WorkspaceIconItemDto; fromServer: boolean }> {
        if (svgContent) {
            this.registerIconImmediate(input.code, svgContent, input.packCode, input.linkedApps, input.linkedActions);
        }
        if (this.iconsApi) {
            try {
                const updated = await lastValueFrom(this.iconsApi.linkTargets({ body: input }));
                if (updated?.svgContent) {
                    this.registerIconImmediate(updated.code, updated.svgContent, updated.packCode, updated.linkedApps, updated.linkedActions);
                }
                return { icon: updated, fromServer: true };
            } catch (err) {
                console.warn('[IconsStudioService] Erro ao vincular targets no servidor:', err);
            }
        }
        const packs = this.readLocalCache();
        const pack = packs.find(p => p.code === input.packCode);
        const found = pack?.icons?.find(i => i.code === input.code);
        if (found) {
            found.linkedApps = input.linkedApps || [];
            found.linkedActions = input.linkedActions || [];
            this.persistLocalCache(packs);
            return { icon: found, fromServer: false };
        }
        return {
            icon: {
                code: input.code,
                packCode: input.packCode,
                linkedApps: input.linkedApps || [],
                linkedActions: input.linkedActions || [],
                svgContent,
            },
            fromServer: false,
        };
    }

    registerIconImmediate(
        code: string,
        svgContent: string,
        packCode?: string,
        linkedApps?: string[],
        linkedActions?: string[]
    ) {
        if (!this.iconLoader || !code || !svgContent) return;
        this.iconLoader.registerSvgLiteral(code, svgContent, packCode);
        for (const appKey of linkedApps || []) {
            const clean = appKey.replace(/^\//, '').trim();
            if (clean) this.iconLoader.registerSvgLiteral(clean, svgContent, packCode);
        }
        for (const act of linkedActions || []) {
            if (act) this.iconLoader.registerSvgLiteral(act, svgContent, packCode);
        }
    }

    private registerPackIconsInRuntime(packs: WorkspaceIconPackDto[]) {
        if (!this.iconLoader) return;
        const manifestEntries: Record<string, any> = {};
        for (const pack of packs) {
            if (pack.isActive === false) continue;
            for (const item of pack.icons || []) {
                if (!item?.code) continue;
                manifestEntries[item.code] = {
                    url: item.assetPath,
                    svgContent: item.svgContent,
                    packCode: pack.code,
                    linkedApps: item.linkedApps,
                    linkedActions: item.linkedActions,
                };
            }
        }
        this.iconLoader.registerFromManifest(manifestEntries);
    }

    async discoverAvailableApps(): Promise<DiscoveredAppTarget[]> {
        const map = new Map<string, DiscoveredAppTarget>();
        for (const app of FALLBACK_APP_TARGETS) {
            map.set(app.appKey.toLowerCase(), { ...app });
        }

        if (this.appsService) {
            try {
                const routesMeta = await this.appsService.getRoutesMetadata();
                for (const meta of routesMeta) {
                    const firstSeg = (meta.fullPath || '').split('/').filter(Boolean)[0];
                    if (!firstSeg) continue;
                    const key = meta.appName || firstSeg;
                    if (!map.has(key.toLowerCase())) {
                        map.set(key.toLowerCase(), {
                            appKey: key,
                            name: meta.title || key,
                            routePath: `/${firstSeg}`,
                            currentIcon: meta.icon,
                        });
                    }
                }
            } catch { }
        }

        if (this.applicationApi) {
            try {
                const serverApps: Application[] = await lastValueFrom(this.applicationApi.getList({ body: { all: true } }));
                for (const app of serverApps || []) {
                    const key = app.appKey || app.name || app.routePath?.replace(/^\//, '');
                    if (!key) continue;
                    const existing = map.get(key.toLowerCase());
                    map.set(key.toLowerCase(), {
                        appKey: key,
                        name: app.name || existing?.name || key,
                        routePath: app.routePath || app.url || existing?.routePath || `/${key}`,
                        currentIcon: app.icon || existing?.currentIcon,
                        iconType: existing?.iconType,
                        categoria: app.categoria || existing?.categoria,
                    });
                }
            } catch { }
        }

        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }

    async discoverAvailableActions(): Promise<DiscoveredActionTarget[]> {
        const map = new Map<string, DiscoveredActionTarget>();
        for (const preset of PRESET_ACTION_TARGETS) {
            map.set(preset.actionId, { ...preset });
        }

        if (this.appsService) {
            try {
                const routesMeta = await this.appsService.getRoutesMetadata();
                for (const meta of routesMeta) {
                    if (meta.manifest && typeof meta.manifest === 'object') {
                        for (const [pattern, entry] of Object.entries(meta.manifest)) {
                            map.set(pattern, {
                                actionId: pattern,
                                label: entry?.label || entry?.title || pattern,
                                source: `Manifest (${meta.fullPath})`,
                                currentIcon: entry?.icon || meta.icon,
                                description: entry?.description || `Rota ${meta.fullPath}`,
                            });
                        }
                    }
                    const menuArrays = [meta.navbar, meta.startMenu, meta.endMenu, meta.userMenu];
                    for (const src of menuArrays) {
                        if (!src) continue;
                        const items = Array.isArray(src) ? src : [src];
                        for (const item of items) {
                            if (!item || typeof item !== 'object') continue;
                            const id = item.id || `route:${meta.fullPath}:${item.label || item.icon || 'action'}`;
                            map.set(id, {
                                actionId: id,
                                label: item.label || item.title || id,
                                source: `Navbar Route (${meta.fullPath})`,
                                currentIcon: item.icon,
                            });
                        }
                    }
                }
            } catch { }
        }

        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
    }

    async readWorkspaceFile(filePath: string): Promise<string | null> {
        if (!this.fileExplorer || !filePath) return null;
        try {
            const res = await lastValueFrom(this.fileExplorer.readFile({ body: { path: filePath } }));
            return typeof res?.data === 'string' ? res.data : null;
        } catch {
            return null;
        }
    }

    async writeWorkspaceFile(filePath: string, data: string): Promise<boolean> {
        if (!this.fileExplorer || !filePath) return false;
        try {
            await lastValueFrom(this.fileExplorer.readFile({
                body: { path: filePath, data, encoding: 'utf-8' }
            }));
            return true;
        } catch {
            return false;
        }
    }

    exportPackAsJsonBundle(pack: WorkspaceIconPackDto) {
        const bundle = {
            name: pack.name,
            code: pack.code,
            version: pack.version || '1.0.0',
            description: pack.description || '',
            targetApps: pack.targetApps || [],
            linkedActions: pack.linkedActions || [],
            icons: Object.fromEntries((pack.icons || []).map(i => [i.code, `${i.code}.svg`])),
            entries: Object.fromEntries((pack.icons || []).map(i => [i.code, {
                file: `${i.code}.svg`,
                name: i.name || i.code,
                usageType: i.usageType || 'app',
                category: i.category || 'App',
                linkedApps: i.linkedApps || [],
                linkedActions: i.linkedActions || [],
                svgContent: i.svgContent || '',
            }])),
        };
        this.downloadTextFile(`${pack.code || 'iconpack'}.iconpack.json`, JSON.stringify(bundle, null, 2), 'application/json');
    }

    downloadSvgFile(fileName: string, svgContent: string) {
        const cleanName = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
        this.downloadTextFile(cleanName, svgContent, 'image/svg+xml');
    }

    private downloadTextFile(filename: string, content: string, mimeType: string) {
        if (typeof document === 'undefined') return;
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    private readLocalCache(): WorkspaceIconPackDto[] {
        if (typeof localStorage === 'undefined') return this.createDefaultSeedPacks();
        try {
            const raw = localStorage.getItem(LOCAL_PACKS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { }
        return this.createDefaultSeedPacks();
    }

    private persistLocalCache(packs: WorkspaceIconPackDto[]) {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(LOCAL_PACKS_STORAGE_KEY, JSON.stringify(packs));
        } catch { }
    }

    private createDefaultSeedPacks(): WorkspaceIconPackDto[] {
        return [
            {
                code: 'v2',
                name: 'Pacote v2 (Aplicativos)',
                version: '2.0.0',
                basePath: 'icons/v2',
                isActive: true,
                isDefault: true,
                source: 'workspace',
                iconCount: 2,
                icons: [
                    {
                        code: 'icones',
                        name: 'Icons Studio',
                        packCode: 'v2',
                        assetPath: 'icons/v2/icons.svg',
                        usageType: 'app',
                        linkedApps: ['Icons'],
                        svgContent: createStarterTemplate('app-badge', '0 0 160 160'),
                    },
                    {
                        code: 'action-bolt',
                        name: 'Ação Rápida',
                        packCode: 'v2',
                        assetPath: 'icons/v2/action-bolt.svg',
                        usageType: 'action',
                        linkedActions: ['navbar:save'],
                        svgContent: createStarterTemplate('action-bolt', '0 0 24 24'),
                    },
                ],
            }
        ];
    }
}
