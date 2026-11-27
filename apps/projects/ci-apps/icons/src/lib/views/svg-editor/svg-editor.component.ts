import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Optional,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@ci/core';
import { IconsStudioService } from '../../icons.service';
import {
    createStarterTemplate,
    moveLayerByDelta,
    nextLayerId,
    optimizeSvgString,
    parseSvgToDocument,
    parseViewBox,
    regularPolygonPoints,
    sanitizeSvgString,
    serializeDocumentToSvg,
    SvgArtboardBg,
    SvgDocumentState,
    SvgLayerItem,
    SvgToolType,
} from '../../models/svg-editor.model';

interface DrawPreviewState {
    tool: SvgToolType;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    points: Array<{ x: number; y: number }>;
}

@Component({
    selector: 'ci-svg-editor',
    standalone: true,
    imports: [
        CommonModule,
        CoreModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ],
    templateUrl: 'svg-editor.component.html',
    styleUrls: ['svg-editor.component.scss'],
})
export class SvgEditorComponent implements OnInit, OnChanges {
    @ViewChild('canvasSvg') canvasSvgRef?: ElementRef<SVGSVGElement>;
    @ViewChild('svgFileInput') svgFileInputRef?: ElementRef<HTMLInputElement>;

    @Input() svgContent?: string;
    @Input() iconCode?: string;
    @Input() packCode?: string;
    @Input() embedded = false;

    @Output() svgContentChange = new EventEmitter<string>();
    @Output() saveRequested = new EventEmitter<string>();

    doc: SvgDocumentState = parseSvgToDocument(createStarterTemplate('app-badge', '0 0 160 160'));
    selectedLayerId: string | null = null;
    selectedTool: SvgToolType = 'select';

    fillColor = '#2f4bff';
    fillEnabled = true;
    useCurrentColorFill = false;
    strokeColor = '#050d42';
    strokeEnabled = false;
    useCurrentColorStroke = false;
    strokeWidth = 4;

    zoom = 100;
    showGrid = true;
    snapToGrid = false;
    gridStep = 8;
    artboardBg: SvgArtboardBg = 'checker';
    viewMode: 'visual' | 'split' | 'code' = 'visual';

    codeDraft = '';
    codeError = '';
    statusMessage = '';

    openedFilePath?: string;
    openedRasterDataUrl?: string;

    undoStack: string[] = [];
    redoStack: string[] = [];

    pointerCoords = { x: 0, y: 0 };
    drawPreview: DrawPreviewState | null = null;
    private isDraggingLayer = false;
    private dragStartSvg = { x: 0, y: 0 };
    private dragLastSvg = { x: 0, y: 0 };
    private dragChanged = false;
    private statusTimer: any = null;

    readonly viewBoxPresets = [
        { label: '24 × 24 (Ações / UI)', value: '0 0 24 24' },
        { label: '32 × 32 (Compacto)', value: '0 0 32 32' },
        { label: '48 × 48 (Médio)', value: '0 0 48 48' },
        { label: '64 × 64 (Tile)', value: '0 0 64 64' },
        { label: '160 × 160 (Apps v2/v3)', value: '0 0 160 160' },
    ];

    readonly toolItems: Array<{ id: SvgToolType; label: string; icon: string }> = [
        { id: 'select', label: 'Selecionar e Mover (V)', icon: 'near_me' },
        { id: 'rect', label: 'Retângulo (R)', icon: 'crop_square' },
        { id: 'circle', label: 'Círculo (C)', icon: 'radio_button_unchecked' },
        { id: 'ellipse', label: 'Elipse (E)', icon: 'panorama_fish_eye' },
        { id: 'line', label: 'Linha (L)', icon: 'horizontal_rule' },
        { id: 'polygon', label: 'Polígono (P)', icon: 'hexagon' },
        { id: 'star', label: 'Estrela (S)', icon: 'star_outline' },
        { id: 'pen', label: 'Traço Livre (B)', icon: 'draw' },
        { id: 'text', label: 'Texto (T)', icon: 'title' },
    ];

    constructor(
        private readonly sanitizer: DomSanitizer,
        @Optional() private readonly route?: ActivatedRoute,
        @Optional() private readonly iconsStudio?: IconsStudioService,
    ) { }

    async ngOnInit() {
        if (this.svgContent) {
            this.loadSvgFromString(this.svgContent, false);
        } else {
            this.codeDraft = this.doc.rawXml;
        }

        if (!this.embedded && this.route) {
            this.route.queryParamMap.subscribe(async params => {
                const fileParam = params.get('file');
                const packParam = params.get('pack');
                const iconParam = params.get('icon');
                if (packParam) this.packCode = packParam;
                if (iconParam) this.iconCode = iconParam;
                if (fileParam) {
                    await this.loadFromWorkspaceFile(fileParam);
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['svgContent'] && typeof this.svgContent === 'string') {
            if (this.svgContent.trim() !== this.doc.rawXml.trim()) {
                this.loadSvgFromString(this.svgContent, false);
            }
        }
    }

    get selectedLayer(): SvgLayerItem | undefined {
        return this.doc.layers.find(l => l.id === this.selectedLayerId);
    }

    get artboardPixelSize(): number {
        return Math.round(360 * (this.zoom / 100));
    }

    get gridMinorStep(): number {
        return this.doc.vbWidth <= 32 ? 2 : this.doc.vbWidth <= 64 ? 4 : 10;
    }

    get gridMajorStep(): number {
        return this.doc.vbWidth <= 32 ? 8 : this.doc.vbWidth <= 64 ? 16 : 40;
    }

    get previewSvgTrusted(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.doc.rawXml);
    }

    trustLayerHtml(inner: string | undefined): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(sanitizeSvgString(inner || ''));
    }

    private async loadFromWorkspaceFile(filePath: string) {
        this.openedFilePath = filePath;
        const lower = filePath.toLowerCase();
        if (/\.(png|jpg|jpeg|webp|ico)$/.test(lower)) {
            this.openedRasterDataUrl = filePath.startsWith('http') || filePath.startsWith('/') ? filePath : undefined;
            this.announceStatus(`Arquivo raster referenciado: ${filePath}`);
            return;
        }
        if (this.iconsStudio) {
            const content = await this.iconsStudio.readWorkspaceFile(filePath);
            if (content) {
                this.openedRasterDataUrl = undefined;
                this.loadSvgFromString(content, false);
                if (!this.iconCode) {
                    const base = filePath.split(/[\\/]/).pop() || '';
                    this.iconCode = base.replace(/\.svg$/i, '');
                }
                this.announceStatus(`Arquivo carregado: ${filePath}`);
            }
        }
    }

    loadSvgFromString(raw: string, recordUndo = true) {
        if (recordUndo) {
            this.pushUndoState();
        } else {
            this.undoStack = [];
            this.redoStack = [];
        }
        this.doc = parseSvgToDocument(raw);
        this.codeDraft = this.doc.rawXml;
        this.codeError = '';
        if (this.selectedLayerId && !this.doc.layers.some(l => l.id === this.selectedLayerId)) {
            this.selectedLayerId = this.doc.layers[0]?.id || null;
        } else if (!this.selectedLayerId && this.doc.layers.length > 0) {
            this.selectedLayerId = this.doc.layers[0].id;
        }
    }

    private pushUndoState() {
        const current = this.doc.rawXml;
        if (this.undoStack[this.undoStack.length - 1] !== current) {
            this.undoStack.push(current);
            if (this.undoStack.length > 40) this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const prev = this.undoStack.pop()!;
        this.redoStack.push(this.doc.rawXml);
        this.doc = parseSvgToDocument(prev);
        this.codeDraft = this.doc.rawXml;
        this.emitChange();
        this.announceStatus('Alteração desfeita');
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const next = this.redoStack.pop()!;
        this.undoStack.push(this.doc.rawXml);
        this.doc = parseSvgToDocument(next);
        this.codeDraft = this.doc.rawXml;
        this.emitChange();
        this.announceStatus('Alteração refeita');
    }

    private commitDoc(recordUndo = true) {
        if (recordUndo) this.pushUndoState();
        const xml = serializeDocumentToSvg(this.doc);
        this.doc = { ...this.doc, rawXml: xml };
        this.codeDraft = xml;
        this.codeError = '';
        this.emitChange();
    }

    private emitChange() {
        this.svgContentChange.emit(this.doc.rawXml);
    }

    setTool(tool: SvgToolType) {
        this.selectedTool = tool;
    }

    selectLayer(id: string | null, event?: Event) {
        event?.stopPropagation();
        this.selectedLayerId = id;
        const layer = this.selectedLayer;
        if (layer) {
            if (layer.fill && layer.fill !== 'none' && layer.fill !== 'currentColor') {
                this.fillColor = layer.fill;
                this.fillEnabled = true;
                this.useCurrentColorFill = false;
            } else if (layer.fill === 'currentColor') {
                this.fillEnabled = true;
                this.useCurrentColorFill = true;
            }
        }
    }

    onCanvasPointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        const pt = this.getSvgPoint(event);
        this.pointerCoords = pt;

        if (this.selectedTool === 'select') {
            this.selectedLayerId = null;
            return;
        }

        if (this.selectedTool === 'text') {
            const label = 'Aa';
            this.pushUndoState();
            const fontSize = Math.max(8, Math.round(this.doc.vbWidth * 0.18));
            const newLayer: SvgLayerItem = {
                id: nextLayerId('text'),
                tag: 'text',
                label: `Texto "${label}"`,
                visible: true,
                x: pt.x,
                y: pt.y,
                fontSize,
                textContent: label,
                fill: this.resolvedFill() || '#050d42',
                stroke: this.resolvedStroke(),
                strokeWidth: this.strokeEnabled ? this.strokeWidth : undefined,
            };
            this.doc.layers = [...this.doc.layers, newLayer];
            this.selectedLayerId = newLayer.id;
            this.commitDoc(false);
            this.selectedTool = 'select';
            return;
        }

        this.drawPreview = {
            tool: this.selectedTool,
            startX: pt.x,
            startY: pt.y,
            currentX: pt.x,
            currentY: pt.y,
            points: [pt],
        };
        (event.target as Element)?.setPointerCapture?.(event.pointerId);
    }

    onLayerPointerDown(event: PointerEvent, layer: SvgLayerItem) {
        if (this.selectedTool !== 'select') return;
        event.stopPropagation();
        this.selectLayer(layer.id);
        const pt = this.getSvgPoint(event);
        this.isDraggingLayer = true;
        this.dragStartSvg = pt;
        this.dragLastSvg = pt;
        this.dragChanged = false;
        this.pushUndoState();
    }

    onCanvasPointerMove(event: PointerEvent) {
        const pt = this.getSvgPoint(event);
        this.pointerCoords = pt;

        if (this.isDraggingLayer && this.selectedLayerId) {
            const dx = pt.x - this.dragLastSvg.x;
            const dy = pt.y - this.dragLastSvg.y;
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                this.dragChanged = true;
                this.doc.layers = this.doc.layers.map(l =>
                    l.id === this.selectedLayerId ? moveLayerByDelta(l, dx, dy) : l
                );
                this.dragLastSvg = pt;
                const xml = serializeDocumentToSvg(this.doc);
                this.doc = { ...this.doc, rawXml: xml };
                this.codeDraft = xml;
            }
            return;
        }

        if (this.drawPreview) {
            this.drawPreview.currentX = pt.x;
            this.drawPreview.currentY = pt.y;
            if (this.drawPreview.tool === 'pen') {
                const last = this.drawPreview.points[this.drawPreview.points.length - 1];
                if (Math.hypot(pt.x - last.x, pt.y - last.y) >= (this.doc.vbWidth <= 32 ? 0.5 : 2)) {
                    this.drawPreview.points.push(pt);
                }
            }
        }
    }

    onCanvasPointerUp(event: PointerEvent) {
        if (this.isDraggingLayer) {
            this.isDraggingLayer = false;
            if (this.dragChanged) {
                this.emitChange();
            } else {
                this.undoStack.pop();
            }
            return;
        }

        if (!this.drawPreview) return;
        const preview = this.drawPreview;
        this.drawPreview = null;

        const minSize = this.doc.vbWidth <= 32 ? 1 : 3;
        const x = Math.min(preview.startX, preview.currentX);
        const y = Math.min(preview.startY, preview.currentY);
        const w = Math.abs(preview.currentX - preview.startX);
        const h = Math.abs(preview.currentY - preview.startY);
        const radius = Math.hypot(preview.currentX - preview.startX, preview.currentY - preview.startY);

        let created: SvgLayerItem | null = null;
        const fill = this.resolvedFill();
        const stroke = this.resolvedStroke();
        const sw = this.strokeEnabled || preview.tool === 'line' || preview.tool === 'pen'
            ? (this.strokeWidth || (this.doc.vbWidth <= 32 ? 2 : 6))
            : undefined;

        if (preview.tool === 'rect' && (w >= minSize || h >= minSize)) {
            created = {
                id: nextLayerId('rect'),
                tag: 'rect',
                label: 'Retângulo',
                visible: true,
                x,
                y,
                width: Math.max(minSize, w),
                height: Math.max(minSize, h),
                rx: 0,
                fill: fill || '#2f4bff',
                stroke,
                strokeWidth: sw,
            };
        } else if (preview.tool === 'circle' && radius >= minSize) {
            created = {
                id: nextLayerId('circle'),
                tag: 'circle',
                label: 'Círculo',
                visible: true,
                cx: preview.startX,
                cy: preview.startY,
                r: Math.round(radius * 100) / 100,
                fill: fill || '#2f4bff',
                stroke,
                strokeWidth: sw,
            };
        } else if (preview.tool === 'ellipse' && (w >= minSize || h >= minSize)) {
            created = {
                id: nextLayerId('ellipse'),
                tag: 'ellipse',
                label: 'Elipse',
                visible: true,
                cx: Math.round((x + w / 2) * 100) / 100,
                cy: Math.round((y + h / 2) * 100) / 100,
                rx: Math.max(minSize, Math.round((w / 2) * 100) / 100),
                ry: Math.max(minSize, Math.round((h / 2) * 100) / 100),
                fill: fill || '#2f4bff',
                stroke,
                strokeWidth: sw,
            };
        } else if (preview.tool === 'line' && radius >= minSize) {
            created = {
                id: nextLayerId('line'),
                tag: 'line',
                label: 'Linha',
                visible: true,
                x1: preview.startX,
                y1: preview.startY,
                x2: preview.currentX,
                y2: preview.currentY,
                fill: 'none',
                stroke: stroke || this.fillColor || '#050d42',
                strokeWidth: sw || (this.doc.vbWidth <= 32 ? 2 : 6),
                strokeLinecap: 'round',
            };
        } else if ((preview.tool === 'polygon' || preview.tool === 'star') && radius >= minSize) {
            const sides = preview.tool === 'star' ? 5 : 6;
            const pts = regularPolygonPoints(
                preview.startX,
                preview.startY,
                radius,
                sides,
                preview.tool === 'star' ? 0.45 : undefined
            );
            created = {
                id: nextLayerId('polygon'),
                tag: 'polygon',
                label: preview.tool === 'star' ? 'Estrela' : 'Hexágono',
                visible: true,
                points: pts,
                fill: fill || '#2f4bff',
                stroke,
                strokeWidth: sw,
                strokeLinejoin: 'round',
            };
        } else if (preview.tool === 'pen' && preview.points.length >= 2) {
            const d = preview.points
                .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ');
            created = {
                id: nextLayerId('path'),
                tag: 'path',
                label: 'Traço',
                visible: true,
                d,
                fill: 'none',
                stroke: stroke || this.fillColor || '#050d42',
                strokeWidth: sw || (this.doc.vbWidth <= 32 ? 2 : 6),
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            };
        }

        if (created) {
            this.pushUndoState();
            this.doc.layers = [...this.doc.layers, created];
            this.selectedLayerId = created.id;
            this.commitDoc(false);
        }
    }

    get previewPathD(): string {
        if (!this.drawPreview || this.drawPreview.points.length < 2) return '';
        return this.drawPreview.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }

    get previewPolygonPoints(): string {
        if (!this.drawPreview) return '';
        const r = Math.hypot(
            this.drawPreview.currentX - this.drawPreview.startX,
            this.drawPreview.currentY - this.drawPreview.startY
        );
        return regularPolygonPoints(
            this.drawPreview.startX,
            this.drawPreview.startY,
            r,
            this.drawPreview.tool === 'star' ? 5 : 6,
            this.drawPreview.tool === 'star' ? 0.45 : undefined
        );
    }

    private getSvgPoint(event: PointerEvent): { x: number; y: number } {
        const svgEl = this.canvasSvgRef?.nativeElement;
        if (!svgEl) return { x: 0, y: 0 };
        const rect = svgEl.getBoundingClientRect();
        if (!rect.width || !rect.height) return { x: 0, y: 0 };
        let x = this.doc.vbX + ((event.clientX - rect.left) / rect.width) * this.doc.vbWidth;
        let y = this.doc.vbY + ((event.clientY - rect.top) / rect.height) * this.doc.vbHeight;
        if (this.snapToGrid) {
            const step = this.gridMinorStep;
            x = Math.round(x / step) * step;
            y = Math.round(y / step) * step;
        }
        return {
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100,
        };
    }

    private resolvedFill(): string {
        if (!this.fillEnabled) return 'none';
        return this.useCurrentColorFill ? 'currentColor' : this.fillColor;
    }

    private resolvedStroke(): string | undefined {
        if (!this.strokeEnabled) return undefined;
        return this.useCurrentColorStroke ? 'currentColor' : this.strokeColor;
    }

    onViewBoxChange(newViewBox: string) {
        const vb = parseViewBox(newViewBox);
        this.pushUndoState();
        this.doc = { ...this.doc, viewBox: newViewBox, ...vb };
        this.commitDoc(false);
    }

    updateSelectedLayer() {
        this.commitDoc(true);
    }

    applyQuickFill(val: string) {
        if (!this.selectedLayer) return;
        this.pushUndoState();
        this.selectedLayer.fill = val;
        this.commitDoc(false);
    }

    applyQuickStroke(val: string) {
        if (!this.selectedLayer) return;
        this.pushUndoState();
        this.selectedLayer.stroke = val;
        if (val !== 'none' && (!this.selectedLayer.strokeWidth || this.selectedLayer.strokeWidth <= 0)) {
            this.selectedLayer.strokeWidth = this.doc.vbWidth <= 32 ? 2 : 4;
        }
        this.commitDoc(false);
    }

    toggleLayerVisibility(layer: SvgLayerItem, event: Event) {
        event.stopPropagation();
        this.pushUndoState();
        layer.visible = !layer.visible;
        this.commitDoc(false);
    }

    moveLayerOrder(index: number, delta: -1 | 1, event: Event) {
        event.stopPropagation();
        const target = index + delta;
        if (target < 0 || target >= this.doc.layers.length) return;
        this.pushUndoState();
        const copy = [...this.doc.layers];
        const [item] = copy.splice(index, 1);
        copy.splice(target, 0, item);
        this.doc.layers = copy;
        this.commitDoc(false);
    }

    duplicateSelectedLayer() {
        const layer = this.selectedLayer;
        if (!layer) return;
        this.pushUndoState();
        const offset = this.doc.vbWidth <= 32 ? 2 : 10;
        const clone = moveLayerByDelta(
            { ...layer, id: nextLayerId(layer.tag), label: `${layer.label} (cópia)` },
            offset,
            offset
        );
        this.doc.layers = [...this.doc.layers, clone];
        this.selectedLayerId = clone.id;
        this.commitDoc(false);
    }

    deleteSelectedLayer() {
        if (!this.selectedLayerId) return;
        this.pushUndoState();
        this.doc.layers = this.doc.layers.filter(l => l.id !== this.selectedLayerId);
        this.selectedLayerId = this.doc.layers[0]?.id || null;
        this.commitDoc(false);
    }

    addQuickShape(type: 'rect' | 'circle' | 'star' | 'path') {
        this.pushUndoState();
        const cx = this.doc.vbX + this.doc.vbWidth / 2;
        const cy = this.doc.vbY + this.doc.vbHeight / 2;
        const unit = Math.round(this.doc.vbWidth * 0.35);
        let item: SvgLayerItem;
        if (type === 'circle') {
            item = { id: nextLayerId('circle'), tag: 'circle', label: 'Círculo', visible: true, cx, cy, r: unit / 2, fill: this.resolvedFill() || '#2f4bff' };
        } else if (type === 'star') {
            item = { id: nextLayerId('polygon'), tag: 'polygon', label: 'Estrela', visible: true, points: regularPolygonPoints(cx, cy, unit * 0.7, 5, 0.45), fill: '#f59e0b' };
        } else if (type === 'path') {
            const s = unit * 0.6;
            item = { id: nextLayerId('path'), tag: 'path', label: 'Seta / Ação', visible: true, d: `M ${cx - s} ${cy} L ${cx + s} ${cy} M ${cx + s * 0.25} ${cy - s * 0.6} L ${cx + s} ${cy} L ${cx + s * 0.25} ${cy + s * 0.6}`, fill: 'none', stroke: 'currentColor', strokeWidth: this.doc.vbWidth <= 32 ? 2 : 8, strokeLinecap: 'round', strokeLinejoin: 'round' };
        } else {
            item = { id: nextLayerId('rect'), tag: 'rect', label: 'Retângulo', visible: true, x: cx - unit / 2, y: cy - unit / 2, width: unit, height: unit, rx: this.doc.vbWidth <= 32 ? 3 : 12, fill: this.resolvedFill() || '#2f4bff' };
        }
        this.doc.layers = [...this.doc.layers, item];
        this.selectedLayerId = item.id;
        this.commitDoc(false);
    }

    applyCodeChanges() {
        const sanitized = sanitizeSvgString(this.codeDraft);
        if (!/<svg\b/i.test(sanitized) || !/<\/\s*svg\s*>/i.test(sanitized)) {
            this.codeError = 'XML inválido: certifique-se de incluir <svg ...>...</svg>.';
            return;
        }
        this.codeError = '';
        this.loadSvgFromString(sanitized, true);
        this.emitChange();
        this.announceStatus('Código SVG aplicado ao canvas');
    }

    optimizeCurrentSvg(convertToCurrentColor = false) {
        this.pushUndoState();
        const optimized = optimizeSvgString(this.doc.rawXml, {
            stripMetadata: true,
            removeIds: true,
            convertToCurrentColor,
        });
        this.doc = parseSvgToDocument(optimized);
        this.codeDraft = this.doc.rawXml;
        this.emitChange();
        this.announceStatus(
            convertToCurrentColor
                ? 'SVG otimizado e convertido para currentColor'
                : 'Metadados removidos e SVG otimizado'
        );
    }

    triggerImportSvg() {
        this.svgFileInputRef?.nativeElement?.click();
    }

    onSvgFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result || '');
            this.loadSvgFromString(text, true);
            this.emitChange();
            this.announceStatus(`Importado: ${file.name}`);
            input.value = '';
        };
        reader.readAsText(file);
    }

    async copyText(value: string, label: string) {
        try {
            await navigator.clipboard.writeText(value);
            this.announceStatus(`${label} copiado`);
        } catch {
            this.announceStatus(`Falha ao copiar ${label}`);
        }
    }

    downloadSvg() {
        const name = this.iconCode || 'icone';
        this.iconsStudio?.downloadSvgFile(name, this.doc.rawXml);
        this.announceStatus(`Download iniciado: ${name}.svg`);
    }

    async saveCurrent() {
        if (this.embedded) {
            this.saveRequested.emit(this.doc.rawXml);
            this.announceStatus('SVG enviado para salvamento no pacote');
            return;
        }
        if (this.openedFilePath && this.iconsStudio) {
            const ok = await this.iconsStudio.writeWorkspaceFile(this.openedFilePath, this.doc.rawXml);
            this.announceStatus(ok ? `Arquivo salvo em ${this.openedFilePath}` : 'Erro ao gravar arquivo no servidor');
            return;
        }
        if (this.packCode && this.iconCode && this.iconsStudio) {
            await this.iconsStudio.saveIcon({
                packCode: this.packCode,
                code: this.iconCode,
                svgContent: this.doc.rawXml,
                viewBox: this.doc.viewBox,
            });
            this.announceStatus(`Ícone "${this.iconCode}" salvo no pacote "${this.packCode}"`);
            return;
        }
        this.downloadSvg();
    }

    changeZoom(delta: number) {
        this.zoom = Math.max(25, Math.min(400, this.zoom + delta));
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            if (event.shiftKey) this.redo();
            else this.undo();
            return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
            event.preventDefault();
            this.redo();
            return;
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
            if (this.selectedLayerId) {
                event.preventDefault();
                this.deleteSelectedLayer();
            }
        }
    }

    private announceStatus(msg: string) {
        clearTimeout(this.statusTimer);
        this.statusMessage = msg;
        this.statusTimer = setTimeout(() => {
            this.statusMessage = '';
        }, 3000);
    }
}
