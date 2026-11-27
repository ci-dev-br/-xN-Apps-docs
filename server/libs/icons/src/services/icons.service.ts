import { BadRequestException, Injectable, Optional } from "@nestjs/common";
import { DataSource, IsNull, Repository } from "typeorm";
import { Icon } from "../models/icon.entity";
import { IconPack } from "../models/icon-pack.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Application } from "@ci/manager/model/application.entity";
import {
    DeleteWorkspaceIconInputDto,
    IconGetInput,
    IconManifestEntryDto,
    IconManifestResponseDto,
    LinkIconTargetInputDto,
    SaveWorkspaceIconInputDto,
    SaveWorkspacePackInputDto,
    WorkspaceIconItemDto,
    WorkspaceIconPackDto,
    WorkspacePacksResponseDto,
} from "../controller/dto/icon.dto";
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class IconCrudService extends DaoFullAuditedServiceBase<Icon> {
    constructor(
        @Optional() snap: SnapshotService,
        @InjectRepository(Icon)
        repository: Repository<Icon>,
    ) {
        super(snap, repository);
    }
}

@Injectable()
export class IconPackCrudService extends DaoFullAuditedServiceBase<IconPack> {
    constructor(
        @Optional() snap: SnapshotService,
        @InjectRepository(IconPack)
        repository: Repository<IconPack>,
    ) {
        super(snap, repository);
    }
}

interface IconPackJsonEntry {
    file?: string;
    name?: string;
    description?: string;
    category?: string;
    usageType?: string;
    tags?: string[];
    linkedApps?: string[];
    linkedActions?: string[];
    viewBox?: string;
}

interface IconPackJsonManifest {
    name?: string;
    description?: string;
    version?: string;
    isActive?: boolean;
    isDefault?: boolean;
    targetApps?: string[];
    linkedActions?: string[];
    icons?: Record<string, string>;
    entries?: Record<string, IconPackJsonEntry>;
}

/**
 * Serviços de catálogo, pacotes e editor SVG de ícones da aplicação
 */
@Injectable()
export class IconsServices {
    constructor(
        @InjectRepository(Icon)
        private readonly repo: Repository<Icon>,
        @InjectRepository(IconPack)
        private readonly packRepo: Repository<IconPack>,
        @Optional()
        private readonly dataSource?: DataSource,
    ) { }

    /**
     * Retorna lista de ícones catalogados
     */
    async obterIcones(input?: IconGetInput) {
        const qb = this.repo.createQueryBuilder('icon')
            .where('icon.deleted IS NULL');
        if (input?.packCode) {
            qb.andWhere('icon.packCode = :packCode', { packCode: input.packCode });
        }
        if (input?.usageType) {
            qb.andWhere('icon.usageType = :usageType', { usageType: input.usageType });
        }
        if (input?.icons && input.icons.length > 0) {
            qb.andWhere('icon.code IN (:...codes)', { codes: input.icons });
        }
        qb.orderBy('icon.code', 'ASC');
        return await qb.getManyAndCount();
    }

    /**
     * Sanitiza markup SVG removendo scripts, handlers inline e URI perigosas
     */
    public sanitizeSvg(rawSvg: string): string {
        if (!rawSvg || typeof rawSvg !== 'string') {
            throw new BadRequestException('Conteúdo SVG inválido ou vazio.');
        }
        let cleaned = rawSvg.trim();
        // Remove XML BOM se existir
        cleaned = cleaned.replace(/^\uFEFF/, '');
        // Remove <script>, <foreignObject>, <iframe>, <object>, <embed>
        cleaned = cleaned.replace(/<\s*(script|foreignObject|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '');
        cleaned = cleaned.replace(/<\s*(script|foreignObject|iframe|object|embed)\b[^>]*\/\s*>/gi, '');
        // Remove event handlers on*="..." ou on*='...'
        cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
        // Remove javascript:, vbscript:, data:text/html
        cleaned = cleaned.replace(/(href|xlink:href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi, '');

        const svgOpenMatch = cleaned.match(/<svg\b[^>]*>/i);
        if (!svgOpenMatch || !/<\/\s*svg\s*>/i.test(cleaned)) {
            throw new BadRequestException('O conteúdo informado não contém um elemento <svg> válido.');
        }

        // Garante namespace xmlns padrão no <svg>
        if (!/xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/i.test(svgOpenMatch[0])) {
            cleaned = cleaned.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        return cleaned;
    }

    private extractViewBox(svg: string): string {
        const vb = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
        if (vb?.[1]) return vb[1].trim();
        const w = svg.match(/\bwidth\s*=\s*["'](\d+(?:\.\d+)?)["']/i);
        const h = svg.match(/\bheight\s*=\s*["'](\d+(?:\.\d+)?)["']/i);
        if (w?.[1] && h?.[1]) return `0 0 ${w[1]} ${h[1]}`;
        return '0 0 160 160';
    }

    private sanitizeSegment(raw: string, allowSpaces = true): string {
        const clean = (raw || '').trim();
        if (!clean || clean === '.' || clean === '..' || clean.includes('/') || clean.includes('\\') || clean.includes('..')) {
            throw new BadRequestException(`Identificador inválido: "${raw}"`);
        }
        const pattern = allowSpaces ? /^[a-zA-Z0-9._\- ]+$/ : /^[a-zA-Z0-9._\-]+$/;
        if (!pattern.test(clean)) {
            throw new BadRequestException(`Identificador contém caracteres não permitidos: "${raw}"`);
        }
        return clean;
    }

    private resolveAppsIconsRoot(): string | null {
        const candidates = [
            path.resolve(process.cwd(), '../apps/public/icons'),
            path.resolve(process.cwd(), 'apps/public/icons'),
            path.resolve(process.cwd(), 'public/icons'),
        ];
        for (const dir of candidates) {
            if (fs.existsSync(dir)) return dir;
        }
        return candidates[0];
    }

    private resolveServerPublicIconsRoot(): string | null {
        const candidates = [
            path.resolve(process.cwd(), 'public/icons'),
            path.resolve(process.cwd(), '../server/public/icons'),
        ];
        for (const dir of candidates) {
            if (fs.existsSync(dir)) return dir;
        }
        return null;
    }

    private readPackJson(packDir: string): IconPackJsonManifest {
        const manifestFile = path.join(packDir, 'iconpack.json');
        if (!fs.existsSync(manifestFile)) return {};
        try {
            const raw = fs.readFileSync(manifestFile, 'utf-8');
            const parsed = JSON.parse(raw);
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch {
            return {};
        }
    }

    private writePackJson(packDir: string, manifest: IconPackJsonManifest) {
        if (!fs.existsSync(packDir)) {
            fs.mkdirSync(packDir, { recursive: true });
        }
        const manifestFile = path.join(packDir, 'iconpack.json');
        fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf-8');
    }

    private formatPackDisplayName(code: string): string {
        const map: Record<string, string> = {
            default: 'Pacote Principal (Raiz)',
            v2: 'Pacote v2 (Aplicativos)',
            v3: 'Pacote v3 (Moderno)',
            apps: 'Aplicações Externas',
            extras: 'Modos & Papéis (Extras)',
            gerencial: 'Módulo Gerencial',
        };
        return map[code] || code.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    private getPackDir(root: string, packCode: string): string {
        if (packCode === 'default') return root;
        const safePack = this.sanitizeSegment(packCode);
        return path.join(root, safePack);
    }

    private getAssetPath(packCode: string, fileName: string): string {
        return packCode === 'default' ? `icons/${fileName}` : `icons/${packCode}/${fileName}`;
    }

    /**
     * Lista e consolida todos os pacotes de ícones (arquivos em public/icons + entidades no banco)
     */
    async getWorkspacePacks(): Promise<WorkspacePacksResponseDto> {
        const appsRoot = this.resolveAppsIconsRoot();
        const dbPacks = await this.packRepo.find({ where: { deleted: IsNull() } });
        const dbIcons = await this.repo.find({ where: { deleted: IsNull() } });

        const packsMap = new Map<string, WorkspaceIconPackDto>();

        const ensurePack = (code: string, base: Partial<WorkspaceIconPackDto>): WorkspaceIconPackDto => {
            let existing = packsMap.get(code);
            if (!existing) {
                existing = {
                    code,
                    name: base.name || this.formatPackDisplayName(code),
                    description: base.description,
                    version: base.version || '1.0.0',
                    basePath: base.basePath || (code === 'default' ? 'icons' : `icons/${code}`),
                    isActive: base.isActive !== false,
                    isDefault: Boolean(base.isDefault),
                    targetApps: base.targetApps || [],
                    linkedActions: base.linkedActions || [],
                    source: base.source || 'workspace',
                    icons: [],
                    iconCount: 0,
                };
                packsMap.set(code, existing);
            }
            return existing;
        };

        // 1. Carrega pacotes do banco
        for (const p of dbPacks) {
            if (!p.code) continue;
            const packDto = ensurePack(p.code, {
                internalId: p.internalId,
                name: p.name || this.formatPackDisplayName(p.code),
                description: p.description,
                version: p.version || '1.0.0',
                basePath: p.basePath || (p.code === 'default' ? 'icons' : `icons/${p.code}`),
                isActive: p.isActive !== false,
                isDefault: Boolean(p.isDefault),
                targetApps: p.targetApps || [],
                linkedActions: p.linkedActions || [],
                source: 'database',
            });
            packDto.internalId = p.internalId;
        }

        // 2. Varre pastas do workspace em apps/public/icons
        if (appsRoot && fs.existsSync(appsRoot)) {
            const scanFolder = (packCode: string, folderPath: string) => {
                const manifest = this.readPackJson(folderPath);
                const packDto = ensurePack(packCode, {
                    name: manifest.name || this.formatPackDisplayName(packCode),
                    description: manifest.description,
                    version: manifest.version || (packCode === 'v2' ? '2.0.0' : packCode === 'v3' ? '3.0.0' : '1.0.0'),
                    basePath: packCode === 'default' ? 'icons' : `icons/${packCode}`,
                    isActive: manifest.isActive !== false,
                    isDefault: manifest.isDefault ?? (packCode === 'v2'),
                    targetApps: manifest.targetApps || [],
                    linkedActions: manifest.linkedActions || [],
                    source: 'workspace',
                });
                if (packDto.source === 'database') {
                    packDto.source = 'both';
                }
                if (manifest.name && !packDto.name) packDto.name = manifest.name;
                if (manifest.description && !packDto.description) packDto.description = manifest.description;

                let dirents: fs.Dirent[] = [];
                try {
                    dirents = fs.readdirSync(folderPath, { withFileTypes: true });
                } catch {
                    dirents = [];
                }

                const pngSet = new Set(
                    dirents
                        .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.png'))
                        .map(d => d.name.slice(0, -4).toLowerCase())
                );

                for (const d of dirents) {
                    if (!d.isFile() || !d.name.toLowerCase().endsWith('.svg')) continue;
                    const fullFile = path.join(folderPath, d.name);
                    const code = d.name.slice(0, -4);
                    let svgContent = '';
                    let fileSize = 0;
                    let updatedAt = '';
                    try {
                        svgContent = fs.readFileSync(fullFile, 'utf-8');
                        const st = fs.statSync(fullFile);
                        fileSize = st.size;
                        updatedAt = st.mtime.toISOString();
                    } catch {
                        continue;
                    }
                    const manifestEntry = manifest.entries?.[code];
                    packDto.icons!.push({
                        code,
                        name: manifestEntry?.name || code,
                        description: manifestEntry?.description,
                        packCode,
                        assetPath: this.getAssetPath(packCode, d.name),
                        svgContent,
                        viewBox: manifestEntry?.viewBox || this.extractViewBox(svgContent),
                        category: manifestEntry?.category || (packCode === 'extras' ? 'Papéis' : packCode === 'gerencial' ? 'Gerencial' : 'App'),
                        usageType: manifestEntry?.usageType || 'app',
                        tags: manifestEntry?.tags || [],
                        linkedApps: manifestEntry?.linkedApps || [],
                        linkedActions: manifestEntry?.linkedActions || [],
                        fileSize,
                        updatedAt,
                        hasPng: pngSet.has(code.toLowerCase()),
                        source: 'workspace',
                    });
                }
            };

            scanFolder('default', appsRoot);
            const subDirs = fs.readdirSync(appsRoot, { withFileTypes: true });
            for (const sub of subDirs) {
                if (sub.isDirectory() && !sub.name.startsWith('.')) {
                    scanFolder(sub.name, path.join(appsRoot, sub.name));
                }
            }
        }

        // 3. Mescla ícones persistidos no banco de dados
        for (const dbIcon of dbIcons) {
            if (!dbIcon.code) continue;
            const packCode = dbIcon.packCode || 'default';
            const packDto = ensurePack(packCode, { source: 'database' });
            const list = packDto.icons!;
            const existing = list.find(i => i.code.toLowerCase() === dbIcon.code!.toLowerCase());
            if (existing) {
                existing.internalId = dbIcon.internalId;
                existing.source = 'both';
                if (dbIcon.name) existing.name = dbIcon.name;
                if (dbIcon.description) existing.description = dbIcon.description;
                if (dbIcon.category) existing.category = dbIcon.category;
                if (dbIcon.usageType) existing.usageType = dbIcon.usageType;
                if (dbIcon.tags?.length) existing.tags = dbIcon.tags;
                if (dbIcon.linkedApps?.length) existing.linkedApps = dbIcon.linkedApps;
                if (dbIcon.linkedActions?.length) existing.linkedActions = dbIcon.linkedActions;
                if (dbIcon.svgContent && !existing.svgContent) existing.svgContent = dbIcon.svgContent;
                if (dbIcon.viewBox) existing.viewBox = dbIcon.viewBox;
            } else {
                list.push({
                    internalId: dbIcon.internalId,
                    code: dbIcon.code,
                    name: dbIcon.name || dbIcon.code,
                    description: dbIcon.description,
                    packCode,
                    assetPath: dbIcon.assetPath || this.getAssetPath(packCode, `${dbIcon.code}.svg`),
                    svgContent: dbIcon.svgContent,
                    viewBox: dbIcon.viewBox || (dbIcon.svgContent ? this.extractViewBox(dbIcon.svgContent) : '0 0 160 160'),
                    category: dbIcon.category || 'Custom',
                    usageType: dbIcon.usageType || 'app',
                    tags: dbIcon.tags || [],
                    linkedApps: dbIcon.linkedApps || [],
                    linkedActions: dbIcon.linkedActions || [],
                    updatedAt: dbIcon.lastModifiedAt ? new Date(dbIcon.lastModifiedAt).toISOString() : undefined,
                    source: 'database',
                });
            }
        }

        const packs = Array.from(packsMap.values()).map(p => {
            const sortedIcons = (p.icons || []).sort((a, b) => a.code.localeCompare(b.code, 'pt-BR'));
            return {
                ...p,
                icons: sortedIcons,
                iconCount: sortedIcons.length,
            };
        }).sort((a, b) => {
            if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
            return a.code.localeCompare(b.code, 'pt-BR');
        });

        return {
            packs,
            appsIconsRoot: appsRoot || undefined,
        };
    }

    /**
     * Cria ou atualiza um pacote de ícones (banco + pasta/iconpack.json)
     */
    async saveWorkspacePack(input: SaveWorkspacePackInputDto): Promise<WorkspaceIconPackDto> {
        const code = this.sanitizeSegment(input.code, false);
        let pack = await this.packRepo.findOne({ where: { code, deleted: IsNull() } });
        if (!pack && input.previousCode) {
            pack = await this.packRepo.findOne({ where: { code: input.previousCode, deleted: IsNull() } });
        }
        if (!pack) {
            pack = this.packRepo.create({ code });
        }
        pack.code = code;
        pack.name = input.name || pack.name || this.formatPackDisplayName(code);
        pack.description = input.description ?? pack.description;
        pack.version = input.version || pack.version || '1.0.0';
        pack.basePath = code === 'default' ? 'icons' : `icons/${code}`;
        pack.isActive = input.isActive !== undefined ? input.isActive : (pack.isActive ?? true);
        pack.isDefault = input.isDefault !== undefined ? input.isDefault : (pack.isDefault ?? false);
        pack.targetApps = input.targetApps ?? pack.targetApps ?? [];
        pack.linkedActions = input.linkedActions ?? pack.linkedActions ?? [];

        const saved = await this.packRepo.save(pack);

        if (input.writeToAssets !== false) {
            const syncDir = (root: string | null) => {
                if (!root) return;
                const packDir = this.getPackDir(root, code);
                const current = this.readPackJson(packDir);
                this.writePackJson(packDir, {
                    ...current,
                    name: saved.name,
                    description: saved.description,
                    version: saved.version,
                    isActive: saved.isActive,
                    isDefault: saved.isDefault,
                    targetApps: saved.targetApps,
                    linkedActions: saved.linkedActions,
                    icons: current.icons || {},
                    entries: current.entries || {},
                });
            };
            syncDir(this.resolveAppsIconsRoot());
            syncDir(this.resolveServerPublicIconsRoot());
        }

        return {
            internalId: saved.internalId,
            code: saved.code!,
            name: saved.name || saved.code!,
            description: saved.description,
            version: saved.version,
            basePath: saved.basePath,
            isActive: saved.isActive,
            isDefault: saved.isDefault,
            targetApps: saved.targetApps || [],
            linkedActions: saved.linkedActions || [],
            source: 'both',
            iconCount: 0,
            icons: [],
        };
    }

    /**
     * Salva ou atualiza um ícone SVG dentro de um pacote (banco + arquivo .svg + iconpack.json + vínculo opcional com Application)
     */
    async saveWorkspaceIcon(input: SaveWorkspaceIconInputDto): Promise<WorkspaceIconItemDto> {
        const packCode = input.packCode === 'default' ? 'default' : this.sanitizeSegment(input.packCode, false);
        const code = this.sanitizeSegment(input.code, true);
        const sanitizedSvg = this.sanitizeSvg(input.svgContent);
        const viewBox = input.viewBox || this.extractViewBox(sanitizedSvg);
        const fileName = `${code}.svg`;
        const assetPath = this.getAssetPath(packCode, fileName);

        // Garante que o pacote existe no banco
        let packEntity = await this.packRepo.findOne({ where: { code: packCode, deleted: IsNull() } });
        if (!packEntity) {
            packEntity = await this.packRepo.save(this.packRepo.create({
                code: packCode,
                name: this.formatPackDisplayName(packCode),
                version: '1.0.0',
                basePath: packCode === 'default' ? 'icons' : `icons/${packCode}`,
                isActive: true,
                isDefault: packCode === 'v2',
            }));
        }

        // Procura ícone existente no banco
        let iconEntity = await this.repo.findOne({
            where: { code, packCode, deleted: IsNull() },
        });
        if (!iconEntity && input.previousCode) {
            iconEntity = await this.repo.findOne({
                where: { code: input.previousCode, packCode, deleted: IsNull() },
            });
        }
        if (!iconEntity) {
            iconEntity = this.repo.create({ code, packCode });
        }

        iconEntity.code = code;
        iconEntity.packCode = packCode;
        iconEntity.pack = packEntity;
        iconEntity.name = input.name || iconEntity.name || code;
        iconEntity.description = input.description ?? iconEntity.description;
        iconEntity.svgContent = sanitizedSvg;
        iconEntity.viewBox = viewBox;
        iconEntity.category = input.category || iconEntity.category || 'Custom';
        iconEntity.usageType = input.usageType || iconEntity.usageType || 'app';
        iconEntity.assetPath = assetPath;
        iconEntity.tags = input.tags ?? iconEntity.tags ?? [];
        iconEntity.linkedApps = input.linkedApps ?? iconEntity.linkedApps ?? [];
        iconEntity.linkedActions = input.linkedActions ?? iconEntity.linkedActions ?? [];

        const savedIcon = await this.repo.save(iconEntity);

        // Escreve nos assets do workspace e server/public/icons
        if (input.writeToAssets !== false) {
            const writeToRoot = (root: string | null) => {
                if (!root) return;
                const packDir = this.getPackDir(root, packCode);
                if (!fs.existsSync(packDir)) {
                    fs.mkdirSync(packDir, { recursive: true });
                }
                if (input.previousCode && input.previousCode !== code) {
                    try {
                        const oldFile = path.join(packDir, `${this.sanitizeSegment(input.previousCode, true)}.svg`);
                        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
                    } catch { }
                }
                fs.writeFileSync(path.join(packDir, fileName), sanitizedSvg, 'utf-8');

                const manifest = this.readPackJson(packDir);
                manifest.icons = manifest.icons || {};
                manifest.entries = manifest.entries || {};
                if (input.previousCode && input.previousCode !== code) {
                    delete manifest.icons[input.previousCode];
                    delete manifest.entries[input.previousCode];
                }
                manifest.icons[code] = fileName;
                manifest.entries[code] = {
                    file: fileName,
                    name: savedIcon.name,
                    description: savedIcon.description,
                    category: savedIcon.category,
                    usageType: savedIcon.usageType,
                    tags: savedIcon.tags,
                    linkedApps: savedIcon.linkedApps,
                    linkedActions: savedIcon.linkedActions,
                    viewBox: savedIcon.viewBox,
                };
                this.writePackJson(packDir, manifest);
            };
            writeToRoot(this.resolveAppsIconsRoot());
            writeToRoot(this.resolveServerPublicIconsRoot());
        }

        if (input.updateApplicationEntity && savedIcon.linkedApps?.length) {
            await this.syncLinkedApplications(savedIcon.code!, savedIcon.linkedApps);
        }

        return {
            internalId: savedIcon.internalId,
            code: savedIcon.code!,
            name: savedIcon.name,
            description: savedIcon.description,
            packCode,
            assetPath,
            svgContent: savedIcon.svgContent,
            viewBox: savedIcon.viewBox,
            category: savedIcon.category,
            usageType: savedIcon.usageType,
            tags: savedIcon.tags,
            linkedApps: savedIcon.linkedApps,
            linkedActions: savedIcon.linkedActions,
            fileSize: Buffer.byteLength(sanitizedSvg, 'utf-8'),
            updatedAt: new Date().toISOString(),
            source: 'both',
        };
    }

    /**
     * Remove um ícone do pacote (soft-delete no banco e opcionalmente exclui o .svg dos assets)
     */
    async deleteWorkspaceIcon(input: DeleteWorkspaceIconInputDto): Promise<{ deleted: boolean; code: string; packCode: string }> {
        const packCode = input.packCode === 'default' ? 'default' : this.sanitizeSegment(input.packCode, false);
        const code = this.sanitizeSegment(input.code, true);

        const existing = await this.repo.findOne({ where: { code, packCode, deleted: IsNull() } });
        if (existing) {
            existing.deleted = true;
            await this.repo.save(existing);
        }

        if (input.deleteAssetFile !== false) {
            const removeFromRoot = (root: string | null) => {
                if (!root) return;
                const packDir = this.getPackDir(root, packCode);
                const svgPath = path.join(packDir, `${code}.svg`);
                if (fs.existsSync(svgPath)) {
                    fs.unlinkSync(svgPath);
                }
                const manifest = this.readPackJson(packDir);
                if (manifest.icons?.[code]) delete manifest.icons[code];
                if (manifest.entries?.[code]) delete manifest.entries[code];
                if (fs.existsSync(path.join(packDir, 'iconpack.json'))) {
                    this.writePackJson(packDir, manifest);
                }
            };
            removeFromRoot(this.resolveAppsIconsRoot());
            removeFromRoot(this.resolveServerPublicIconsRoot());
        }

        return { deleted: true, code, packCode };
    }

    /**
     * Vincula um ícone a Apps e Ações da plataforma (e opcionalmente atualiza Application.icon no banco)
     */
    async linkTargets(input: LinkIconTargetInputDto): Promise<WorkspaceIconItemDto> {
        const packCode = input.packCode === 'default' ? 'default' : this.sanitizeSegment(input.packCode, false);
        const code = this.sanitizeSegment(input.code, true);
        const fileName = `${code}.svg`;
        const assetPath = input.assetPath || this.getAssetPath(packCode, fileName);

        let iconEntity = await this.repo.findOne({ where: { code, packCode, deleted: IsNull() } });
        if (!iconEntity) {
            // Tenta ler o SVG do workspace para persistir no banco
            let svgContent: string | undefined;
            const appsRoot = this.resolveAppsIconsRoot();
            if (appsRoot) {
                const candidate = path.join(this.getPackDir(appsRoot, packCode), fileName);
                if (fs.existsSync(candidate)) {
                    svgContent = fs.readFileSync(candidate, 'utf-8');
                }
            }
            iconEntity = this.repo.create({
                code,
                packCode,
                name: code,
                assetPath,
                svgContent,
                viewBox: svgContent ? this.extractViewBox(svgContent) : '0 0 160 160',
                usageType: input.linkedActions?.length && !input.linkedApps?.length ? 'action' : (input.linkedActions?.length && input.linkedApps?.length ? 'both' : 'app'),
            });
        }

        iconEntity.linkedApps = Array.from(new Set(input.linkedApps || []));
        iconEntity.linkedActions = Array.from(new Set(input.linkedActions || []));
        if (iconEntity.linkedApps.length && iconEntity.linkedActions.length) {
            iconEntity.usageType = 'both';
        } else if (iconEntity.linkedActions.length) {
            iconEntity.usageType = 'action';
        } else if (iconEntity.linkedApps.length) {
            iconEntity.usageType = 'app';
        }

        const saved = await this.repo.save(iconEntity);

        const updateManifestRoot = (root: string | null) => {
            if (!root) return;
            const packDir = this.getPackDir(root, packCode);
            if (!fs.existsSync(packDir)) return;
            const manifest = this.readPackJson(packDir);
            manifest.icons = manifest.icons || {};
            manifest.entries = manifest.entries || {};
            manifest.icons[code] = fileName;
            manifest.entries[code] = {
                ...(manifest.entries[code] || {}),
                file: fileName,
                linkedApps: saved.linkedApps,
                linkedActions: saved.linkedActions,
                usageType: saved.usageType,
            };
            this.writePackJson(packDir, manifest);
        };
        updateManifestRoot(this.resolveAppsIconsRoot());
        updateManifestRoot(this.resolveServerPublicIconsRoot());

        if (input.updateApplicationEntity && saved.linkedApps?.length) {
            await this.syncLinkedApplications(saved.code!, saved.linkedApps);
        }

        return {
            internalId: saved.internalId,
            code: saved.code!,
            name: saved.name || saved.code,
            packCode,
            assetPath: saved.assetPath || assetPath,
            svgContent: saved.svgContent,
            viewBox: saved.viewBox,
            usageType: saved.usageType,
            linkedApps: saved.linkedApps,
            linkedActions: saved.linkedActions,
            source: 'both',
        };
    }

    private async syncLinkedApplications(iconCode: string, appKeys: string[]) {
        if (!this.dataSource) return;
        try {
            const appRepo = this.dataSource.getRepository(Application);
            for (const key of appKeys) {
                if (!key) continue;
                const clean = key.replace(/^\//, '').trim();
                const found = await appRepo.findOne({
                    where: [
                        { appKey: clean },
                        { name: clean },
                        { routePath: `/${clean}` },
                        { url: `/${clean}` },
                    ]
                });
                if (found) {
                    found.icon = iconCode;
                    await appRepo.save(found);
                }
            }
        } catch (err) {
            // Caso o módulo Manager não esteja carregado, ignora silenciosamente
            console.warn('[IconsServices] Não foi possível atualizar Application.icon:', (err as any)?.message || err);
        }
    }

    /**
     * Retorna o manifesto unificado de ícones ativos para carregamento dinâmico no IconLoaderSerices
     */
    async getRuntimeManifest(): Promise<IconManifestResponseDto> {
        const workspace = await this.getWorkspacePacks();
        const icons: Record<string, IconManifestEntryDto> = {};
        const activePacks: string[] = [];

        for (const pack of workspace.packs) {
            if (pack.isActive === false) continue;
            activePacks.push(pack.code);
            for (const item of pack.icons || []) {
                const existing = icons[item.code];
                if (!existing || pack.isDefault || item.source === 'both' || item.source === 'database') {
                    icons[item.code] = {
                        url: item.assetPath,
                        svgContent: item.svgContent,
                        packCode: pack.code,
                        linkedApps: item.linkedApps,
                        linkedActions: item.linkedActions,
                    };
                }
                // Também registra aliases vinculados para ações e apps se apontarem para um ícone diferente
                for (const actionKey of item.linkedActions || []) {
                    if (actionKey && !icons[actionKey]) {
                        icons[actionKey] = {
                            url: item.assetPath,
                            svgContent: item.svgContent,
                            packCode: pack.code,
                            linkedApps: item.linkedApps,
                            linkedActions: item.linkedActions,
                        };
                    }
                }
            }
        }

        return { icons, activePacks };
    }
}
