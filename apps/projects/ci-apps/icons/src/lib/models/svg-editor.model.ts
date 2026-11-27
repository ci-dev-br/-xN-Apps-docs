export type SvgToolType =
    | 'select'
    | 'rect'
    | 'circle'
    | 'ellipse'
    | 'line'
    | 'polygon'
    | 'star'
    | 'pen'
    | 'text';

export type SvgArtboardBg = 'checker' | 'light' | 'dark';

export interface SvgLayerItem {
    id: string;
    tag: string;
    label: string;
    visible: boolean;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: string;
    strokeLinejoin?: string;
    opacity?: number;
    transform?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rx?: number;
    cx?: number;
    cy?: number;
    r?: number;
    ry?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    points?: string;
    d?: string;
    textContent?: string;
    fontSize?: number;
    rawInnerHtml?: string;
    extraAttrs?: Record<string, string>;
}

export interface SvgDocumentState {
    viewBox: string;
    vbX: number;
    vbY: number;
    vbWidth: number;
    vbHeight: number;
    layers: SvgLayerItem[];
    rawXml: string;
}

export interface SvgOptimizeOptions {
    stripMetadata?: boolean;
    removeIds?: boolean;
    convertToCurrentColor?: boolean;
}

export type SvgTemplateId =
    | 'blank'
    | 'app-badge'
    | 'action-bolt'
    | 'action-gear'
    | 'document'
    | 'star';

const DRAWABLE_TAGS = new Set([
    'path',
    'rect',
    'circle',
    'ellipse',
    'line',
    'polygon',
    'polyline',
    'text',
    'g',
]);

let layerUidCounter = 1;
export function nextLayerId(tag = 'shape'): string {
    return `${tag}-${Date.now().toString(36)}-${layerUidCounter++}`;
}

export function sanitizeSvgString(rawSvg: string): string {
    if (!rawSvg || typeof rawSvg !== 'string') return '';
    let cleaned = rawSvg.trim().replace(/^\uFEFF/, '');
    cleaned = cleaned.replace(/<\s*(script|foreignObject|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '');
    cleaned = cleaned.replace(/<\s*(script|foreignObject|iframe|object|embed)\b[^>]*\/\s*>/gi, '');
    cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    cleaned = cleaned.replace(/(href|xlink:href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi, '');
    return cleaned;
}

export function parseViewBox(viewBox?: string): { vbX: number; vbY: number; vbWidth: number; vbHeight: number } {
    const parts = (viewBox || '0 0 160 160')
        .trim()
        .split(/[\s,]+/)
        .map(Number);
    if (parts.length === 4 && parts.every(n => Number.isFinite(n))) {
        return {
            vbX: parts[0],
            vbY: parts[1],
            vbWidth: Math.max(1, parts[2]),
            vbHeight: Math.max(1, parts[3]),
        };
    }
    return { vbX: 0, vbY: 0, vbWidth: 160, vbHeight: 160 };
}

function parseStyleString(styleAttr: string | null): Record<string, string> {
    const result: Record<string, string> = {};
    if (!styleAttr) return result;
    for (const part of styleAttr.split(';')) {
        const idx = part.indexOf(':');
        if (idx === -1) continue;
        const k = part.slice(0, idx).trim().toLowerCase();
        const v = part.slice(idx + 1).trim();
        if (k && v) result[k] = v;
    }
    return result;
}

function numAttr(el: Element, name: string): number | undefined {
    const val = el.getAttribute(name);
    if (val === null || val === '') return undefined;
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : undefined;
}

export function parseSvgToDocument(svgString: string): SvgDocumentState {
    const safe = sanitizeSvgString(svgString);
    if (typeof DOMParser === 'undefined' || !safe) {
        const vb = parseViewBox('0 0 160 160');
        return {
            viewBox: '0 0 160 160',
            ...vb,
            layers: [],
            rawXml: safe || createStarterTemplate('blank', '0 0 160 160'),
        };
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(safe, 'image/svg+xml');
    let svgEl = xmlDoc.querySelector('svg');
    if (!svgEl || xmlDoc.querySelector('parsererror')) {
        const htmlDoc = parser.parseFromString(safe, 'text/html');
        svgEl = htmlDoc.querySelector('svg');
    }

    if (!svgEl) {
        const fallback = createStarterTemplate('blank', '0 0 160 160');
        const vb = parseViewBox('0 0 160 160');
        return { viewBox: '0 0 160 160', ...vb, layers: [], rawXml: fallback };
    }

    let viewBox = svgEl.getAttribute('viewBox') || '';
    if (!viewBox) {
        const w = parseFloat(svgEl.getAttribute('width') || '160') || 160;
        const h = parseFloat(svgEl.getAttribute('height') || '160') || 160;
        viewBox = `0 0 ${w} ${h}`;
    }
    const vb = parseViewBox(viewBox);

    const layers: SvgLayerItem[] = [];
    const knownHandledAttrs = new Set([
        'id', 'style', 'display', 'visibility', 'fill', 'stroke', 'stroke-width',
        'stroke-linecap', 'stroke-linejoin', 'opacity', 'transform',
        'x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r',
        'x1', 'y1', 'x2', 'y2', 'points', 'd', 'font-size',
    ]);

    Array.from(svgEl.children).forEach((child, idx) => {
        const tag = child.tagName.toLowerCase();
        if (!DRAWABLE_TAGS.has(tag)) return;
        const styleMap = parseStyleString(child.getAttribute('style'));
        const extraAttrs: Record<string, string> = {};
        for (const attr of Array.from(child.attributes)) {
            const name = attr.name;
            if (!knownHandledAttrs.has(name.toLowerCase()) && !name.toLowerCase().startsWith('on')) {
                extraAttrs[name] = attr.value;
            }
        }

        const display = child.getAttribute('display') || styleMap['display'];
        const visibility = child.getAttribute('visibility') || styleMap['visibility'];
        const visible = display !== 'none' && visibility !== 'hidden';

        const fill = child.getAttribute('fill') ?? styleMap['fill'];
        const stroke = child.getAttribute('stroke') ?? styleMap['stroke'];
        const swRaw = child.getAttribute('stroke-width') ?? styleMap['stroke-width'];
        const opRaw = child.getAttribute('opacity') ?? styleMap['opacity'];

        const layer: SvgLayerItem = {
            id: child.getAttribute('id') || nextLayerId(tag),
            tag,
            label: child.getAttribute('data-name') || child.getAttribute('id') || `${tag.toUpperCase()} #${idx + 1}`,
            visible,
            fill: fill ?? (tag === 'line' || tag === 'polyline' ? 'none' : undefined),
            stroke: stroke ?? undefined,
            strokeWidth: swRaw ? parseFloat(swRaw) : undefined,
            strokeLinecap: child.getAttribute('stroke-linecap') ?? styleMap['stroke-linecap'],
            strokeLinejoin: child.getAttribute('stroke-linejoin') ?? styleMap['stroke-linejoin'],
            opacity: opRaw ? parseFloat(opRaw) : undefined,
            transform: child.getAttribute('transform') ?? undefined,
            x: numAttr(child, 'x'),
            y: numAttr(child, 'y'),
            width: numAttr(child, 'width'),
            height: numAttr(child, 'height'),
            rx: numAttr(child, 'rx'),
            ry: numAttr(child, 'ry'),
            cx: numAttr(child, 'cx'),
            cy: numAttr(child, 'cy'),
            r: numAttr(child, 'r'),
            x1: numAttr(child, 'x1'),
            y1: numAttr(child, 'y1'),
            x2: numAttr(child, 'x2'),
            y2: numAttr(child, 'y2'),
            points: child.getAttribute('points') ?? undefined,
            d: child.getAttribute('d') ?? undefined,
            textContent: tag === 'text' ? (child.textContent ?? '') : undefined,
            fontSize: numAttr(child, 'font-size'),
            rawInnerHtml: tag === 'g' ? child.innerHTML : undefined,
            extraAttrs: Object.keys(extraAttrs).length ? extraAttrs : undefined,
        };
        layers.push(layer);
    });

    const state: SvgDocumentState = {
        viewBox,
        ...vb,
        layers,
        rawXml: safe,
    };
    return state;
}

function escapeXmlAttr(value: string): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeXmlText(value: string): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function fmtNum(val: number | undefined): string | undefined {
    if (val === undefined || !Number.isFinite(val)) return undefined;
    return String(Math.round(val * 100) / 100);
}

export function serializeDocumentToSvg(doc: SvgDocumentState): string {
    const lines: string[] = [];
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXmlAttr(doc.viewBox || '0 0 160 160')}">`);

    for (const layer of doc.layers) {
        const attrs: string[] = [];
        if (layer.tag === 'rect') {
            if (layer.x !== undefined) attrs.push(`x="${fmtNum(layer.x)}"`);
            if (layer.y !== undefined) attrs.push(`y="${fmtNum(layer.y)}"`);
            if (layer.width !== undefined) attrs.push(`width="${fmtNum(layer.width)}"`);
            if (layer.height !== undefined) attrs.push(`height="${fmtNum(layer.height)}"`);
            if (layer.rx !== undefined && layer.rx > 0) attrs.push(`rx="${fmtNum(layer.rx)}"`);
        } else if (layer.tag === 'circle') {
            if (layer.cx !== undefined) attrs.push(`cx="${fmtNum(layer.cx)}"`);
            if (layer.cy !== undefined) attrs.push(`cy="${fmtNum(layer.cy)}"`);
            if (layer.r !== undefined) attrs.push(`r="${fmtNum(layer.r)}"`);
        } else if (layer.tag === 'ellipse') {
            if (layer.cx !== undefined) attrs.push(`cx="${fmtNum(layer.cx)}"`);
            if (layer.cy !== undefined) attrs.push(`cy="${fmtNum(layer.cy)}"`);
            if (layer.rx !== undefined) attrs.push(`rx="${fmtNum(layer.rx)}"`);
            if (layer.ry !== undefined) attrs.push(`ry="${fmtNum(layer.ry)}"`);
        } else if (layer.tag === 'line') {
            if (layer.x1 !== undefined) attrs.push(`x1="${fmtNum(layer.x1)}"`);
            if (layer.y1 !== undefined) attrs.push(`y1="${fmtNum(layer.y1)}"`);
            if (layer.x2 !== undefined) attrs.push(`x2="${fmtNum(layer.x2)}"`);
            if (layer.y2 !== undefined) attrs.push(`y2="${fmtNum(layer.y2)}"`);
        } else if (layer.tag === 'polygon' || layer.tag === 'polyline') {
            if (layer.points !== undefined) attrs.push(`points="${escapeXmlAttr(layer.points)}"`);
        } else if (layer.tag === 'path') {
            if (layer.d !== undefined) attrs.push(`d="${escapeXmlAttr(layer.d)}"`);
        } else if (layer.tag === 'text') {
            if (layer.x !== undefined) attrs.push(`x="${fmtNum(layer.x)}"`);
            if (layer.y !== undefined) attrs.push(`y="${fmtNum(layer.y)}"`);
            if (layer.fontSize !== undefined) attrs.push(`font-size="${fmtNum(layer.fontSize)}"`);
        }

        if (layer.fill !== undefined && layer.fill !== '') attrs.push(`fill="${escapeXmlAttr(layer.fill)}"`);
        if (layer.stroke !== undefined && layer.stroke !== '') attrs.push(`stroke="${escapeXmlAttr(layer.stroke)}"`);
        if (layer.strokeWidth !== undefined && layer.strokeWidth > 0) attrs.push(`stroke-width="${fmtNum(layer.strokeWidth)}"`);
        if (layer.strokeLinecap) attrs.push(`stroke-linecap="${escapeXmlAttr(layer.strokeLinecap)}"`);
        if (layer.strokeLinejoin) attrs.push(`stroke-linejoin="${escapeXmlAttr(layer.strokeLinejoin)}"`);
        if (layer.opacity !== undefined && layer.opacity < 1) attrs.push(`opacity="${fmtNum(layer.opacity)}"`);
        if (layer.transform) attrs.push(`transform="${escapeXmlAttr(layer.transform)}"`);
        if (!layer.visible) attrs.push(`display="none"`);

        if (layer.extraAttrs) {
            for (const [k, v] of Object.entries(layer.extraAttrs)) {
                attrs.push(`${k}="${escapeXmlAttr(v)}"`);
            }
        }

        const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
        if (layer.tag === 'text') {
            lines.push(`  <text${attrStr}>${escapeXmlText(layer.textContent || '')}</text>`);
        } else if (layer.tag === 'g') {
            lines.push(`  <g${attrStr}>${layer.rawInnerHtml || ''}</g>`);
        } else {
            lines.push(`  <${layer.tag}${attrStr} />`);
        }
    }

    lines.push('</svg>');
    return lines.join('\n');
}

export function optimizeSvgString(svgString: string, options: SvgOptimizeOptions = {}): string {
    const stripMetadata = options.stripMetadata !== false;
    let out = sanitizeSvgString(svgString);
    if (!out) return '';

    if (stripMetadata) {
        out = out.replace(/<\?xml[\s\S]*?\?>/gi, '');
        out = out.replace(/<\?xpacket[\s\S]*?\?>/gi, '');
        out = out.replace(/<!--[\s\S]*?-->/g, '');
        out = out.replace(/<\s*metadata\b[^>]*>[\s\S]*?<\/\s*metadata\s*>/gi, '');
        out = out.replace(/<\s*title\b[^>]*>[\s\S]*?<\/\s*title\s*>/gi, '');
        out = out.replace(/<\s*desc\b[^>]*>[\s\S]*?<\/\s*desc\s*>/gi, '');
        out = out.replace(/<\s*defs\b[^>]*\s*\/>/gi, '');
        out = out.replace(/\s+(?:data-name|xmlns:xlink|xml:space)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
    }

    if (options.removeIds) {
        out = out.replace(/\s+id\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
    }

    if (options.convertToCurrentColor) {
        out = out.replace(/fill\s*:\s*(?!none\b|transparent\b)[^;"']+/gi, 'fill:currentColor');
        out = out.replace(/fill\s*=\s*(["'])(?!none\b|transparent\b)[^"']+\1/gi, 'fill="currentColor"');
        out = out.replace(/stroke\s*:\s*(?!none\b|transparent\b)[^;"']+/gi, 'stroke:currentColor');
        out = out.replace(/stroke\s*=\s*(["'])(?!none\b|transparent\b)[^"']+\1/gi, 'stroke="currentColor"');
    }

    const parsed = parseSvgToDocument(out);
    if (parsed.layers.length > 0) {
        return serializeDocumentToSvg(parsed);
    }
    return out.trim();
}

export function regularPolygonPoints(
    cx: number,
    cy: number,
    radius: number,
    sides: number,
    starInnerRatio?: number
): string {
    const pts: string[] = [];
    const total = starInnerRatio ? sides * 2 : sides;
    const startAngle = -Math.PI / 2;
    for (let i = 0; i < total; i++) {
        const angle = startAngle + (i * Math.PI * 2) / total;
        const r = starInnerRatio && i % 2 === 1 ? radius * starInnerRatio : radius;
        const x = Math.round((cx + Math.cos(angle) * r) * 100) / 100;
        const y = Math.round((cy + Math.sin(angle) * r) * 100) / 100;
        pts.push(`${x},${y}`);
    }
    return pts.join(' ');
}

export function moveLayerByDelta(layer: SvgLayerItem, dx: number, dy: number): SvgLayerItem {
    const next = { ...layer };
    const r = (n: number) => Math.round(n * 100) / 100;
    if (next.tag === 'rect' || next.tag === 'text') {
        next.x = r((next.x ?? 0) + dx);
        next.y = r((next.y ?? 0) + dy);
    } else if (next.tag === 'circle' || next.tag === 'ellipse') {
        next.cx = r((next.cx ?? 0) + dx);
        next.cy = r((next.cy ?? 0) + dy);
    } else if (next.tag === 'line') {
        next.x1 = r((next.x1 ?? 0) + dx);
        next.y1 = r((next.y1 ?? 0) + dy);
        next.x2 = r((next.x2 ?? 0) + dx);
        next.y2 = r((next.y2 ?? 0) + dy);
    } else {
        // Para path, polygon, polyline ou g: aplica/atualiza translate(tx, ty)
        const current = next.transform || '';
        const match = current.match(/translate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)/i);
        const curX = match ? parseFloat(match[1]) || 0 : 0;
        const curY = match ? parseFloat(match[2] ?? '0') || 0 : 0;
        const newTranslate = `translate(${r(curX + dx)}, ${r(curY + dy)})`;
        if (match) {
            next.transform = current.replace(match[0], newTranslate);
        } else {
            next.transform = current ? `${newTranslate} ${current}` : newTranslate;
        }
    }
    return next;
}

export function createStarterTemplate(templateId: SvgTemplateId, viewBox = '0 0 160 160'): string {
    const isSmall = viewBox === '0 0 24 24';
    if (templateId === 'blank') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n</svg>`;
    }
    if (templateId === 'app-badge') {
        return isSmall
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <rect x="2" y="2" width="20" height="20" rx="5" fill="#2f4bff" />\n  <circle cx="12" cy="12" r="5" fill="#ffffff" />\n</svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">\n  <rect x="16" y="16" width="128" height="128" rx="28" fill="#2f4bff" />\n  <circle cx="80" cy="80" r="34" fill="#ffffff" opacity="0.95" />\n  <rect x="64" y="64" width="32" height="32" rx="8" fill="#050d42" />\n</svg>`;
    }
    if (templateId === 'action-bolt') {
        return isSmall
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />\n</svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">\n  <path d="M88 16L32 92h44l-8 52 60-76H84l4-52z" fill="currentColor" />\n</svg>`;
    }
    if (templateId === 'action-gear') {
        return isSmall
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.5" />\n  <circle cx="12" cy="12" r="2.5" fill="currentColor" />\n</svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">\n  <circle cx="80" cy="80" r="46" fill="none" stroke="currentColor" stroke-width="14" />\n  <circle cx="80" cy="80" r="18" fill="currentColor" />\n  <rect x="72" y="14" width="16" height="22" rx="4" fill="currentColor" />\n  <rect x="72" y="124" width="16" height="22" rx="4" fill="currentColor" />\n  <rect x="14" y="72" width="22" height="16" rx="4" fill="currentColor" />\n  <rect x="124" y="72" width="22" height="16" rx="4" fill="currentColor" />\n</svg>`;
    }
    if (templateId === 'document') {
        return isSmall
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M6 2h8l5 5v15H6V2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />\n  <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />\n  <line x1="9" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />\n</svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">\n  <path d="M36 20h58l30 30v90H36V20z" fill="#e8eefc" stroke="#2f4bff" stroke-width="6" stroke-linejoin="round" />\n  <line x1="54" y1="74" x2="106" y2="74" stroke="#050d42" stroke-width="6" stroke-linecap="round" />\n  <line x1="54" y1="98" x2="96" y2="98" stroke="#050d42" stroke-width="6" stroke-linecap="round" />\n</svg>`;
    }
    // star
    const pts = isSmall
        ? regularPolygonPoints(12, 12, 10, 5, 0.45)
        : regularPolygonPoints(80, 80, 60, 5, 0.45);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n  <polygon points="${pts}" fill="#f59e0b" stroke="#050d42" stroke-width="${isSmall ? 1.5 : 4}" stroke-linejoin="round" />\n</svg>`;
}
