import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    BlockComponentInputSchema,
    DynamicBlockNode,
    DynamicBlockSpecification,
    DynamicComponentDefinition,
} from './blocks-builder.models';

export interface BlockContextMenuContext {
    block: DynamicBlockNode;
    list: DynamicBlockNode[];
    index: number;
    isChild: boolean;
}

@Component({
    selector: 'ci-blocks-builder',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DragDropModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
    ],
    templateUrl: './blocks-builder.component.html',
    styleUrl: './blocks-builder.component.scss',
})
export class BlocksBuilderComponent implements OnChanges {
    /** Lista de componentes disponíveis e seus respectivos inputs configuráveis */
    @Input() availableComponents: DynamicComponentDefinition[] = [];

    /** Especificação JSON atual da tela em blocos */
    @Input() value: DynamicBlockSpecification | null = null;

    /** Emite sempre que a especificação de blocos é modificada */
    @Output() valueChange = new EventEmitter<DynamicBlockSpecification>();

    /** Emite quando o usuário aciona explicitamente o salvamento */
    @Output() saveRequested = new EventEmitter<DynamicBlockSpecification>();

    /** Emite quando o usuário solicita visualizar apenas este componente em rota isolada */
    @Output() previewBlockRequested = new EventEmitter<DynamicBlockNode>();

    @ViewChild('blockContextTrigger') blockContextTrigger?: MatMenuTrigger;
    @ViewChild('canvasContextTrigger') canvasContextTrigger?: MatMenuTrigger;

    protected spec: DynamicBlockSpecification = this.createEmptySpec();
    protected selectedBlockId: string | null = null;
    protected paletteSearch = '';
    protected activeTabIndex = 0;
    protected jsonDraft = '';
    protected jsonError: string | null = null;
    protected xmlDraft = '';
    protected xmlError: string | null = null;
    protected jsonDraftMap: Record<string, string> = {};

    protected contextMenuPosition = { x: '0px', y: '0px' };
    protected contextMenuData: BlockContextMenuContext | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value'] || changes['availableComponents']) {
            this.spec = this.normalizeSpec(this.value ?? this.spec);
            if (this.selectedBlockId && !this.findBlockById(this.spec.blocks || [], this.selectedBlockId)) {
                this.selectedBlockId = null;
            }
            this.syncJsonDraft();
            this.syncBlockInputJsonDrafts();
        }
    }

    protected get filteredComponents(): DynamicComponentDefinition[] {
        const term = this.paletteSearch.trim().toLowerCase();
        if (!term) return this.availableComponents || [];
        return (this.availableComponents || []).filter(c =>
            c.title.toLowerCase().includes(term) ||
            c.name.toLowerCase().includes(term) ||
            (c.category || '').toLowerCase().includes(term) ||
            (c.description || '').toLowerCase().includes(term)
        );
    }

    protected get selectedBlock(): DynamicBlockNode | null {
        if (!this.selectedBlockId) return null;
        return this.findBlockById(this.spec.blocks || [], this.selectedBlockId);
    }

    protected get selectedComponentDefinition(): DynamicComponentDefinition | undefined {
        const block = this.selectedBlock;
        if (!block) return undefined;
        return this.getComponentDefinition(block.componentName);
    }

    getComponentDefinition(componentName: string): DynamicComponentDefinition | undefined {
        return (this.availableComponents || []).find(c => c.name === componentName);
    }

    createBlockFromDefinition(component: DynamicComponentDefinition): DynamicBlockNode {
        const inputs: Record<string, any> = {};
        for (const inputDef of component.inputs || []) {
            if (inputDef.defaultValue !== undefined) {
                inputs[inputDef.name] = this.deepClone(inputDef.defaultValue);
            }
        }

        return {
            id: this.generateId(),
            componentName: component.name,
            label: component.title,
            inputs,
            children: component.allowChildren ? [] : undefined,
        };
    }

    addBlock(component: DynamicComponentDefinition, parentBlock?: DynamicBlockNode, insertIndex?: number): void {
        const newBlock = this.createBlockFromDefinition(component);

        if (parentBlock && this.getComponentDefinition(parentBlock.componentName)?.allowChildren) {
            const children = [...(parentBlock.children || [])];
            if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= children.length) {
                children.splice(insertIndex, 0, newBlock);
            } else {
                children.push(newBlock);
            }
            parentBlock.children = children;
        } else {
            const rootBlocks = [...(this.spec.blocks || [])];
            if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= rootBlocks.length) {
                rootBlocks.splice(insertIndex, 0, newBlock);
            } else {
                rootBlocks.push(newBlock);
            }
            this.spec.blocks = rootBlocks;
        }

        this.selectedBlockId = newBlock.id;
        this.syncBlockInputJsonDrafts();
        this.emitChange();
    }

    addToSelectedOrRoot(component: DynamicComponentDefinition): void {
        const selected = this.selectedBlock;
        if (selected && this.getComponentDefinition(selected.componentName)?.allowChildren) {
            this.addBlock(component, selected);
            return;
        }
        this.addBlock(component);
    }

    selectBlock(block: DynamicBlockNode, event?: Event): void {
        event?.stopPropagation();
        this.selectedBlockId = block.id;
        this.syncBlockInputJsonDrafts();
    }

    duplicateBlock(block: DynamicBlockNode, list: DynamicBlockNode[], event?: Event): void {
        event?.stopPropagation();
        const cloned = this.cloneBlockWithNewIds(block);
        const index = list.findIndex(b => b.id === block.id);
        list.splice(index + 1, 0, cloned);
        this.selectedBlockId = cloned.id;
        this.syncBlockInputJsonDrafts();
        this.emitChange();
    }

    removeBlock(blockId: string, list: DynamicBlockNode[], event?: Event): void {
        event?.stopPropagation();
        const index = list.findIndex(b => b.id === blockId);
        if (index >= 0) {
            list.splice(index, 1);
            if (this.selectedBlockId === blockId) {
                this.selectedBlockId = null;
            }
            this.emitChange();
        }
    }

    moveBlock(list: DynamicBlockNode[], index: number, direction: -1 | 1, event?: Event): void {
        event?.stopPropagation();
        const target = index + direction;
        if (target < 0 || target >= list.length) return;
        moveItemInArray(list, index, target);
        this.emitChange();
    }

    moveBlockToRoot(ctx: BlockContextMenuContext): void {
        if (!ctx.isChild) return;
        const rootBlocks = this.spec.blocks || (this.spec.blocks = []);
        const idx = ctx.list.findIndex(b => b.id === ctx.block.id);
        if (idx >= 0) {
            transferArrayItem(ctx.list, rootBlocks, idx, rootBlocks.length);
            this.selectedBlockId = ctx.block.id;
            this.emitChange();
        }
    }

    copyBlockJson(block: DynamicBlockNode): void {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(JSON.stringify(block, null, 2)).catch(() => {});
        }
    }

    clearAllBlocks(): void {
        this.spec.blocks = [];
        this.selectedBlockId = null;
        this.emitChange();
    }

    onDropBlock(event: CdkDragDrop<DynamicBlockNode[]>, targetList: DynamicBlockNode[], targetParent?: DynamicBlockNode): void {
        const destinationList = targetParent
            ? (targetParent.children ??= [])
            : (this.spec.blocks ??= []);

        // Caso 1: Arrastado da paleta de componentes para o canvas ou container
        if (event.previousContainer.id === 'palette-drop-list') {
            const comp = event.item.data as DynamicComponentDefinition | undefined;
            if (!comp) return;
            const newBlock = this.createBlockFromDefinition(comp);
            destinationList.splice(event.currentIndex, 0, newBlock);
            this.selectedBlockId = newBlock.id;
            this.syncBlockInputJsonDrafts();
            this.emitChange();
            return;
        }

        // Caso 2: Reordenação dentro da mesma lista
        if (event.previousContainer === event.container) {
            if (event.previousIndex === event.currentIndex) return;
            moveItemInArray(destinationList, event.previousIndex, event.currentIndex);
            this.emitChange();
            return;
        }

        // Caso 3: Transferência entre listas (raiz <-> container ou entre containers)
        const draggedBlock = event.item.data as DynamicBlockNode | undefined;
        if (targetParent && draggedBlock) {
            if (draggedBlock.id === targetParent.id || this.findBlockById(draggedBlock.children || [], targetParent.id)) {
                return;
            }
        }

        transferArrayItem(
            event.previousContainer.data,
            destinationList,
            event.previousIndex,
            event.currentIndex
        );
        this.emitChange();
    }

    onDropJsonPalette(event: CdkDragDrop<DynamicBlockNode[]>): void {
        if (event.previousContainer.id !== 'palette-drop-list') return;
        const comp = event.item.data as DynamicComponentDefinition | undefined;
        if (!comp) return;
        this.addToSelectedOrRoot(comp);
    }

    openBlockContextMenu(
        event: MouseEvent,
        block: DynamicBlockNode,
        list: DynamicBlockNode[],
        index: number,
        isChild = false
    ): void {
        event.preventDefault();
        event.stopPropagation();
        this.selectBlock(block);
        this.contextMenuData = { block, list, index, isChild };
        this.contextMenuPosition = {
            x: `${event.clientX}px`,
            y: `${event.clientY}px`,
        };
        this.canvasContextTrigger?.closeMenu();
        this.blockContextTrigger?.openMenu();
    }

    openCanvasContextMenu(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.contextMenuPosition = {
            x: `${event.clientX}px`,
            y: `${event.clientY}px`,
        };
        this.blockContextTrigger?.closeMenu();
        this.canvasContextTrigger?.openMenu();
    }

    onSpecFieldChange(): void {
        this.emitChange();
    }

    onBlockLabelChange(block: DynamicBlockNode, label: string): void {
        block.label = label;
        this.emitChange();
    }

    onInputValueChange(block: DynamicBlockNode, inputDef: BlockComponentInputSchema, value: any): void {
        if (!block.inputs) block.inputs = {};
        if (inputDef.type === 'number') {
            block.inputs[inputDef.name] = value === '' || value === null ? null : Number(value);
        } else {
            block.inputs[inputDef.name] = value;
        }
        this.emitChange();
    }

    onJsonInputChange(block: DynamicBlockNode, inputDef: BlockComponentInputSchema, rawText: string): void {
        const key = `${block.id}:${inputDef.name}`;
        this.jsonDraftMap[key] = rawText;
        try {
            const parsed = JSON.parse(rawText);
            if (!block.inputs) block.inputs = {};
            block.inputs[inputDef.name] = parsed;
            this.jsonError = null;
            this.emitChange();
        } catch {
            this.jsonError = `JSON inválido no campo "${inputDef.label || inputDef.name}".`;
        }
    }

    applyRawJson(): void {
        try {
            const parsed = JSON.parse(this.jsonDraft);
            this.spec = this.normalizeSpec(parsed);
            this.jsonError = null;
            this.syncXmlDraft();
            this.syncBlockInputJsonDrafts();
            this.emitChange(false);
        } catch {
            this.jsonError = 'O JSON informado é inválido. Verifique a sintaxe antes de aplicar.';
        }
    }

    copyJson(): void {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(this.jsonDraft).catch(() => {});
        }
    }

    applyRawXml(): void {
        try {
            const parsed = this.parseXmlToSpec(this.xmlDraft);
            this.spec = this.normalizeSpec(parsed);
            this.xmlError = null;
            this.syncJsonDraft();
            this.syncBlockInputJsonDrafts();
            this.emitChange(false);
        } catch (err: any) {
            this.xmlError = err?.message || 'O XML/HTML5 informado é inválido. Verifique a sintaxe antes de aplicar.';
        }
    }

    copyXml(): void {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(this.xmlDraft).catch(() => {});
        }
    }

    requestSave(): void {
        this.saveRequested.emit(this.deepClone(this.spec));
    }

    previewBlock(block: DynamicBlockNode, event?: Event): void {
        event?.stopPropagation();
        this.previewBlockRequested.emit(this.deepClone(block));
    }

    trackById(_index: number, item: DynamicBlockNode): string {
        return item.id;
    }

    trackByName(_index: number, item: { name: string }): string {
        return item.name;
    }

    protected getJsonInputText(block: DynamicBlockNode, inputName: string): string {
        const key = `${block.id}:${inputName}`;
        if (this.jsonDraftMap[key] !== undefined) {
            return this.jsonDraftMap[key];
        }
        const val = block.inputs?.[inputName];
        return val !== undefined ? JSON.stringify(val, null, 2) : '';
    }

    protected getPreviewTableColumns(block: DynamicBlockNode): string[] {
        const cols = block.inputs?.['columns'];
        return Array.isArray(cols) ? cols.map(String) : ['id', 'name'];
    }

    protected getPreviewListItems(block: DynamicBlockNode): Array<Record<string, any>> {
        const items = block.inputs?.['items'];
        return Array.isArray(items) ? items : [];
    }

    protected getPreviewFormFields(block: DynamicBlockNode): Array<Record<string, any>> {
        const fields = block.inputs?.['fields'];
        return Array.isArray(fields) ? fields : [];
    }

    private emitChange(updateJson = true): void {
        this.updateOrders(this.spec.blocks || []);
        if (updateJson) {
            this.syncJsonDraft();
            this.syncXmlDraft();
        }
        this.valueChange.emit(this.deepClone(this.spec));
    }

    private syncJsonDraft(): void {
        this.jsonDraft = JSON.stringify(this.spec, null, 2);
        this.syncXmlDraft();
    }

    private syncXmlDraft(): void {
        this.xmlDraft = this.serializeSpecToXml(this.spec);
    }

    serializeSpecToXml(spec: DynamicBlockSpecification): string {
        const attrs: string[] = [];
        if (spec.name) attrs.push(`name="${this.escapeXmlAttr(spec.name)}"`);
        if (spec.route) attrs.push(`route="${this.escapeXmlAttr(spec.route)}"`);
        if (spec.layout) attrs.push(`layout="${this.escapeXmlAttr(spec.layout)}"`);
        if (spec.version) attrs.push(`version="${this.escapeXmlAttr(spec.version)}"`);

        const openTag = attrs.length ? `<dynamic-screen ${attrs.join(' ')}>` : '<dynamic-screen>';
        const childrenXml = (spec.blocks || [])
            .map(block => this.serializeBlockToXml(block, 1))
            .join('\n');

        return childrenXml
            ? `${openTag}\n${childrenXml}\n</dynamic-screen>`
            : `${openTag}\n</dynamic-screen>`;
    }

    private serializeBlockToXml(block: DynamicBlockNode, indentLevel: number): string {
        const indent = '  '.repeat(indentLevel);
        const tag = this.sanitizeTagName(block.componentName);
        const attrs: string[] = [`data-id="${this.escapeXmlAttr(block.id)}"`];
        if (block.label) {
            attrs.push(`data-label="${this.escapeXmlAttr(block.label)}"`);
        }

        const inputs = block.inputs || {};
        for (const [key, val] of Object.entries(inputs)) {
            if (val === undefined) continue;
            const safeAttr = this.sanitizeAttrName(key);
            const serialized = typeof val === 'string' ? val : JSON.stringify(val);
            attrs.push(`${safeAttr}="${this.escapeXmlAttr(serialized)}"`);
        }

        const openTag = `${indent}<${tag} ${attrs.join(' ')}>`;
        if (block.children && block.children.length > 0) {
            const inner = block.children
                .map(child => this.serializeBlockToXml(child, indentLevel + 1))
                .join('\n');
            return `${openTag}\n${inner}\n${indent}</${tag}>`;
        }
        return `${openTag}</${tag}>`;
    }

    parseXmlToSpec(xmlText: string): DynamicBlockSpecification {
        const trimmed = (xmlText || '').trim();
        if (!trimmed) {
            return this.createEmptySpec();
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'application/xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            throw new Error('XML/HTML5 inválido: verifique fechamento de tags e aspas de atributos.');
        }

        const root = doc.documentElement;
        if (!root) {
            throw new Error('Elemento raiz não encontrado no XML.');
        }

        const isWrapper = root.tagName.toLowerCase() === 'dynamic-screen';
        const elements = isWrapper ? Array.from(root.children) : [root];

        return {
            version: (isWrapper ? root.getAttribute('version') : null) || this.spec.version || '1.0.0',
            name: (isWrapper ? root.getAttribute('name') : null) || this.spec.name || 'Nova Tela',
            route: (isWrapper ? root.getAttribute('route') : null) || '',
            layout: (isWrapper ? root.getAttribute('layout') : null) || 'vertical',
            blocks: elements.map((el, idx) => this.parseElementToBlock(el, idx)),
            metadata: this.spec.metadata ? this.deepClone(this.spec.metadata) : {},
        };
    }

    private parseElementToBlock(el: Element, order: number): DynamicBlockNode {
        const componentName = el.tagName.toLowerCase();
        const def = this.getComponentDefinition(componentName);
        const id = el.getAttribute('data-id') || el.getAttribute('id') || this.generateId();
        const label = el.getAttribute('data-label') || def?.title || componentName;
        const inputs: Record<string, any> = {};

        for (const attr of Array.from(el.attributes)) {
            if (attr.name === 'data-id' || attr.name === 'id' || attr.name === 'data-label') {
                continue;
            }
            const inputDef = def?.inputs?.find(i => i.name === attr.name);
            inputs[attr.name] = this.coerceXmlAttributeValue(attr.value, inputDef?.type);
        }

        const childElements = Array.from(el.children);
        const allowChildren = def?.allowChildren || childElements.length > 0;

        return {
            id,
            componentName,
            label,
            order,
            inputs,
            children: allowChildren
                ? childElements.map((childEl, ci) => this.parseElementToBlock(childEl, ci))
                : undefined,
        };
    }

    private coerceXmlAttributeValue(raw: string, type?: string): any {
        if (type === 'number') {
            const n = Number(raw);
            return Number.isNaN(n) ? raw : n;
        }
        if (type === 'boolean') {
            return raw === 'true' || raw === '';
        }
        if (type === 'json') {
            try {
                return JSON.parse(raw);
            } catch {
                return raw;
            }
        }
        if (!type) {
            if (raw === 'true') return true;
            if (raw === 'false') return false;
            if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
                try {
                    return JSON.parse(raw);
                } catch {
                    return raw;
                }
            }
        }
        return raw;
    }

    private sanitizeTagName(name: string): string {
        const cleaned = (name || 'block').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        return /^[a-z]/.test(cleaned) ? cleaned : `ci-${cleaned}`;
    }

    private sanitizeAttrName(name: string): string {
        const cleaned = (name || 'attr').replace(/[^a-zA-Z0-9_:-]/g, '-');
        return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `data-${cleaned}`;
    }

    private escapeXmlAttr(value: string): string {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    private syncBlockInputJsonDrafts(): void {
        const block = this.selectedBlock;
        const def = this.selectedComponentDefinition;
        if (!block || !def) return;
        for (const inputDef of def.inputs) {
            if (inputDef.type === 'json') {
                const key = `${block.id}:${inputDef.name}`;
                const val = block.inputs?.[inputDef.name];
                this.jsonDraftMap[key] = val !== undefined ? JSON.stringify(val, null, 2) : '[]';
            }
        }
    }

    private updateOrders(blocks: DynamicBlockNode[]): void {
        blocks.forEach((b, idx) => {
            b.order = idx;
            if (b.children?.length) {
                this.updateOrders(b.children);
            }
        });
    }

    private findBlockById(blocks: DynamicBlockNode[], id: string): DynamicBlockNode | null {
        for (const block of blocks) {
            if (block.id === id) return block;
            if (block.children?.length) {
                const found = this.findBlockById(block.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    private cloneBlockWithNewIds(block: DynamicBlockNode): DynamicBlockNode {
        return {
            ...this.deepClone(block),
            id: this.generateId(),
            label: block.label ? `${block.label} (cópia)` : block.componentName,
            children: block.children?.map(child => this.cloneBlockWithNewIds(child)),
        };
    }

    private normalizeSpec(input: DynamicBlockSpecification | null | undefined): DynamicBlockSpecification {
        if (!input) return this.createEmptySpec();
        return {
            version: input.version || '1.0.0',
            name: input.name || 'Nova Tela',
            route: input.route || '',
            layout: input.layout || 'vertical',
            blocks: Array.isArray(input.blocks) ? this.normalizeBlocks(this.deepClone(input.blocks)) : [],
            metadata: input.metadata ? this.deepClone(input.metadata) : {},
        };
    }

    private normalizeBlocks(blocks: DynamicBlockNode[]): DynamicBlockNode[] {
        return blocks.map(block => {
            const def = this.getComponentDefinition(block.componentName);
            const hasChildren = def?.allowChildren || Array.isArray(block.children);
            return {
                ...block,
                inputs: block.inputs || {},
                children: hasChildren ? this.normalizeBlocks(block.children || []) : undefined,
            };
        });
    }

    private createEmptySpec(): DynamicBlockSpecification {
        return {
            version: '1.0.0',
            name: 'Nova Tela',
            route: '',
            layout: 'vertical',
            blocks: [],
            metadata: {},
        };
    }

    private generateId(): string {
        return `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    }

    private deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
}
