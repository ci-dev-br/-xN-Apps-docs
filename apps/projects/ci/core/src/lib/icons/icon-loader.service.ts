import { Inject, Injectable, Optional, signal } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { CI_ICON_PACK, IPack, IPackEntry } from "./token";

@Injectable({
    providedIn: 'root'
})
export class IconLoaderSerices {
    private readonly _registeredIcons = signal<Record<string, IPackEntry>>({});
    readonly registeredIcons = this._registeredIcons.asReadonly();

    constructor(
        @Optional() private readonly sz?: DomSanitizer,
        @Optional() private readonly registry?: MatIconRegistry,
        @Optional() @Inject(CI_ICON_PACK) pack?: IPack | IPack[],
    ) {
        if (pack) {
            const packs = Array.isArray(pack) ? pack : [pack];
            for (const p of packs) {
                if (p) this.load(p);
            }
        }
    }

    /**
     * Sanitiza markup SVG antes de registrar como literal no MatIconRegistry
     */
    sanitizeSvgMarkup(rawSvg: string): string {
        if (!rawSvg || typeof rawSvg !== 'string') return '';
        let cleaned = rawSvg.trim().replace(/^\uFEFF/, '');
        cleaned = cleaned.replace(/<\s*(script|foreignObject|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '');
        cleaned = cleaned.replace(/<\s*(script|foreignObject|iframe|object|embed)\b[^>]*\/\s*>/gi, '');
        cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
        cleaned = cleaned.replace(/(href|xlink:href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi, '');
        return cleaned;
    }

    async load(pack: IPack) {
        if (!this.sz || !this.registry || !pack) return;
        const nextMap: Record<string, IPackEntry> = { ...this._registeredIcons() };
        for (const p of Object.keys(pack)) {
            const icon = pack[p];
            if (!icon) continue;
            if (icon.svgContent) {
                this.registerSvgLiteralInternal(p, icon.svgContent, icon.packCode);
                nextMap[p] = { ...icon };
            } else if (icon.url) {
                const url = this.sz.bypassSecurityTrustResourceUrl(icon.url);
                this.registry.addSvgIcon(p, url);
                if (icon.packCode) {
                    this.registry.addSvgIconInNamespace(icon.packCode, p, url);
                }
                nextMap[p] = { ...icon };
            }
        }
        this._registeredIcons.set(nextMap);
    }

    registerSvgLiteral(name: string, svgContent: string, namespace?: string): boolean {
        if (!name || !svgContent || !this.sz || !this.registry) return false;
        const sanitized = this.registerSvgLiteralInternal(name, svgContent, namespace);
        if (!sanitized) return false;
        this._registeredIcons.update(curr => ({
            ...curr,
            [name]: {
                ...(curr[name] || {}),
                svgContent: sanitized,
                ...(namespace ? { packCode: namespace } : {}),
            }
        }));
        return true;
    }

    registerFromManifest(entries: Record<string, IPackEntry> | undefined | null) {
        if (!entries || !this.sz || !this.registry) return;
        const nextMap: Record<string, IPackEntry> = { ...this._registeredIcons() };
        for (const [code, entry] of Object.entries(entries)) {
            if (!entry) continue;
            if (entry.svgContent) {
                this.registerSvgLiteralInternal(code, entry.svgContent, entry.packCode);
            } else if (entry.url) {
                const safeUrl = this.sz.bypassSecurityTrustResourceUrl(entry.url);
                this.registry.addSvgIcon(code, safeUrl);
                if (entry.packCode) {
                    this.registry.addSvgIconInNamespace(entry.packCode, code, safeUrl);
                }
            }
            nextMap[code] = { ...entry };
            for (const appKey of entry.linkedApps || []) {
                const normApp = appKey.replace(/^\//, '').trim();
                if (!normApp) continue;
                if (entry.svgContent) {
                    this.registerSvgLiteralInternal(normApp, entry.svgContent, entry.packCode);
                } else if (entry.url) {
                    this.registry.addSvgIcon(normApp, this.sz.bypassSecurityTrustResourceUrl(entry.url));
                }
            }
        }
        this._registeredIcons.set(nextMap);
    }

    private registerSvgLiteralInternal(name: string, svgContent: string, namespace?: string): string | null {
        if (!this.sz || !this.registry) return null;
        const sanitized = this.sanitizeSvgMarkup(svgContent);
        if (!sanitized || !/<svg\b/i.test(sanitized)) return null;
        const safeHtml = this.sz.bypassSecurityTrustHtml(sanitized);
        this.registry.addSvgIconLiteral(name, safeHtml);
        if (namespace) {
            this.registry.addSvgIconLiteralInNamespace(namespace, name, safeHtml);
        }
        return sanitized;
    }
}
