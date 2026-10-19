import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    ElementRef,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    SimpleChanges,
    NgZone,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Optional
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import mermaid, { MermaidConfig } from 'mermaid';
import * as babelParser from '@babel/parser';
import { CiCdkModule, JsonToTsService } from '@ci/cdk';
import { MonacoWorkspaceService } from '../code-editor/monaco-workspace.service';

export interface UmlNodeSelectEvent {
    type: 'class' | 'interface' | 'property' | 'method' | 'import' | 'package';
    name: string;
    className?: string;
    packageName?: string;
    importSource?: string;
    lineNumber?: number;
    column?: number;
}

export interface UmlJsDocTag {
    tag: string;
    name?: string;
    type?: string;
    text: string;
}

export interface UmlJsDocInfo {
    description: string;
    tags: UmlJsDocTag[];
}

export interface UmlMemberInfo {
    name: string;
    kind: 'property' | 'method';
    type?: string;
    visibility: 'public' | 'private' | 'protected';
    isStatic: boolean;
    params?: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    jsdoc?: UmlJsDocInfo;
}

export interface UmlClassInfo {
    name: string;
    kind: 'class' | 'interface';
    isAbstract?: boolean;
    isImported: boolean;
    importSource?: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    members: Map<string, UmlMemberInfo>;
    jsdoc?: UmlJsDocInfo;
}

@Component({
    selector: 'uml-viewer',
    standalone: true,
    imports: [
        CiCdkModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ],
    templateUrl: 'uml-viewer.html',
    styleUrls: ['uml-viewer.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UmlViewer implements OnChanges, AfterViewInit, OnDestroy {
    @Input({ required: true }) javascriptCode?: string;
    @Input() filePath?: string | null;
    @Input() activeLine?: number;

    @Output() nodeSelect = new EventEmitter<UmlNodeSelectEvent>();
    @Output() codeChange = new EventEmitter<string>();

    @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;
    @ViewChild('mermaidContainer', { static: true }) mermaidContainerRef!: ElementRef<HTMLDivElement>;

    error: string | null = null;
    scale = 1;
    translateX = 0;
    translateY = 0;

    // Metadados extraídos do AST
    public classesByName = new Map<string, UmlClassInfo>();
    public packagesBySource = new Map<string, string>();
    private svgNodesByClassName = new Map<string, SVGElement>();
    private currentActiveClassName: string | null = null;
    public selectedClassInfo: UmlClassInfo | null = null;

    // Modo diagrama geral (com dependências locais e tsconfig)
    public showGeneralDiagram = true;

    // Estado do construtor e edição visual de código
    public isNewClassModalOpen = false;
    public newClassData = {
        name: '',
        kind: 'class' as 'class' | 'interface' | 'abstract',
        extendsClass: '',
        implementsInterface: ''
    };

    public isEditClassModalOpen = false;
    public editClassData = {
        originalName: '',
        name: '',
        kind: 'class' as 'class' | 'interface' | 'abstract',
        extendsClass: '',
        implementsInterface: '',
        startLine: 1,
        endLine: 1
    };

    public isRelationshipModalOpen = false;
    public relationshipData = {
        sourceClassName: '',
        targetClassName: '',
        relationType: 'association' as 'extends' | 'implements' | 'association' | 'injection',
        memberName: ''
    };

    public isMemberModalOpen = false;
    public memberModalMode: 'add' | 'edit' = 'add';
    public memberTargetClassName = '';
    public memberData = {
        kind: 'property' as 'property' | 'method',
        name: '',
        type: 'string',
        visibility: 'public' as 'public' | 'private' | 'protected',
        isStatic: false,
        params: '',
        loc: null as { startLine: number, endLine: number } | null
    };

    private isViewInit = false;
    private isDragging = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private hasMovedSignificantly = false;
    private startX = 0;
    private startY = 0;
    private rafId: number | null = null;
    private debounceTimer: any = null;
    private renderSeq = 0;
    private lastRenderedCode: string | null = null;
    private shouldAutoFit = true;
    private resizeObserver?: ResizeObserver;

    // Dimensões naturais do diagrama para cálculo de enquadramento
    private diagramNaturalWidth = 800;
    private diagramNaturalHeight = 600;

    // Touch support
    private lastTouchDist = 0;

    constructor(
        public jsonToTs: JsonToTsService,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef,
        @Optional() private workspaceService?: MonacoWorkspaceService
    ) {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            useMaxWidth: false
        } as MermaidConfig & { useMaxWidth?: boolean });
    }

    ngAfterViewInit(): void {
        this.isViewInit = true;

        this.ngZone.runOutsideAngular(() => {
            const viewport = this.viewportRef.nativeElement;
            viewport.addEventListener('wheel', this.handleWheel, { passive: false });
            viewport.addEventListener('mousedown', this.handleMouseDown);
            viewport.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            viewport.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            viewport.addEventListener('touchend', this.handleTouchEnd);
        });

        if (typeof ResizeObserver !== 'undefined' && this.viewportRef?.nativeElement) {
            this.resizeObserver = new ResizeObserver(() => {
                if (!this.isDragging) {
                    this.fitToViewport();
                }
            });
            this.resizeObserver.observe(this.viewportRef.nativeElement);
        }

        this.shouldAutoFit = true;
        this.renderDiagram();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['filePath'] && !changes['filePath'].firstChange) {
            this.shouldAutoFit = true;
            this.classesByName.clear();
            this.svgNodesByClassName.clear();
            this.currentActiveClassName = null;
            this.selectedClassInfo = null;
        }

        if (changes['javascriptCode']) {
            if (this.isViewInit) {
                this.scheduleRender();
            }
        }

        if (changes['activeLine'] && this.activeLine !== undefined) {
            this.handleActiveLineChanged(this.activeLine);
        }
    }

    ngOnDestroy(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        this.resizeObserver?.disconnect();

        const viewport = this.viewportRef?.nativeElement;
        if (viewport) {
            viewport.removeEventListener('wheel', this.handleWheel);
            viewport.removeEventListener('mousedown', this.handleMouseDown);
            viewport.removeEventListener('touchstart', this.handleTouchStart);
            viewport.removeEventListener('touchmove', this.handleTouchMove);
            viewport.removeEventListener('touchend', this.handleTouchEnd);
        }

        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    // --- Sincronização Monaco -> UML (destaca e centraliza a classe ativa) ---
    private handleActiveLineChanged(line: number): void {
        if (!line || !this.classesByName.size) return;

        for (const [className, classInfo] of this.classesByName.entries()) {
            if (!classInfo.isImported && classInfo.startLine <= line && line <= classInfo.endLine) {
                this.setActiveEditorNode(className, true);
                return;
            }
        }
    }

    public setActiveEditorNode(className: string, panToNode: boolean = true): void {
        if (this.currentActiveClassName === className) return;
        this.currentActiveClassName = className;

        const prevActive = this.mermaidContainerRef?.nativeElement?.querySelectorAll('.uml-node-active');
        prevActive?.forEach(el => el.classList.remove('uml-node-active'));

        const targetG = this.svgNodesByClassName.get(className);
        if (targetG) {
            targetG.classList.add('uml-node-active');

            if (panToNode && !this.isDragging) {
                this.centerNodeInViewport(targetG);
            }
        }
    }

    public setSelectedNode(className: string): void {
        const classInfo = this.classesByName.get(className);
        this.selectedClassInfo = classInfo || null;

        const prevSelected = this.mermaidContainerRef?.nativeElement?.querySelectorAll('.uml-node-selected');
        prevSelected?.forEach(el => el.classList.remove('uml-node-selected'));

        const targetG = this.svgNodesByClassName.get(className);
        if (targetG) {
            targetG.classList.add('uml-node-selected');
        }

        this.cdr.markForCheck();
    }

    private centerNodeInViewport(targetG: SVGElement): void {
        const viewport = this.viewportRef?.nativeElement;
        if (!viewport || !targetG) return;

        const vpRect = viewport.getBoundingClientRect();
        if (vpRect.width <= 0 || vpRect.height <= 0) return;

        try {
            const bbox = (targetG as any).getBBox();
            if (!bbox || bbox.width <= 0 || bbox.height <= 0) return;

            const nodeCenterX = bbox.x + bbox.width / 2;
            const nodeCenterY = bbox.y + bbox.height / 2;

            const targetX = (vpRect.width / 2) - (nodeCenterX * this.scale);
            const targetY = (vpRect.height / 2) - (nodeCenterY * this.scale);

            const zoomGroup = this.mermaidContainerRef?.nativeElement?.querySelector('.mermaid-vector-root') as SVGElement;
            if (zoomGroup) {
                zoomGroup.style.transition = 'transform 0.35s cubic-bezier(0.2, 0, 0, 1)';
                this.translateX = targetX;
                this.translateY = targetY;
                this.applyTransform();

                setTimeout(() => {
                    if (zoomGroup) {
                        zoomGroup.style.transition = 'none';
                    }
                }, 360);
            }
        } catch { }
    }

    // --- Vinculação de Interações no SVG do Mermaid ---
    private bindSvgInteractions(): void {
        const svg = this.mermaidContainerRef?.nativeElement?.querySelector('svg');
        if (!svg) return;

        this.svgNodesByClassName.clear();
        const gElements = Array.from(svg.querySelectorAll('g'));

        for (const g of gElements) {
            const id = g.getAttribute('id') || '';
            const classAttr = g.getAttribute('class') || '';

            // 1. Identifica clusters de pacotes / namespaces
            if (classAttr.includes('cluster') || id.includes('cluster')) {
                const titleText = g.querySelector('text')?.textContent?.trim() || '';
                for (const [source, pkgName] of this.packagesBySource.entries()) {
                    const safePkg = pkgName.replace(/[^a-zA-Z0-9_]/g, '_');
                    if (titleText.includes(safePkg) || id.includes(safePkg)) {
                        g.classList.add('uml-package-interactive');
                        g.setAttribute('data-package-source', source);
                        g.setAttribute('data-package-name', pkgName);

                        g.addEventListener('click', (ev: MouseEvent) => {
                            if (this.hasMovedSignificantly) return;
                            ev.stopPropagation();
                            this.nodeSelect.emit({
                                type: 'package',
                                name: pkgName,
                                importSource: source
                            });
                        });
                        break;
                    }
                }
                continue;
            }

            // 2. Identifica nós de classes
            let matchedClassName: string | null = null;

            for (const className of this.classesByName.keys()) {
                if (id.includes(`classId-${className}`) || id === className) {
                    matchedClassName = className;
                    break;
                }
            }

            if (!matchedClassName) {
                const titleElement = g.querySelector('.title, .classTitle, tspan.title, span.nodeLabel, text');
                const titleText = titleElement?.textContent?.trim();
                if (titleText && this.classesByName.has(titleText)) {
                    matchedClassName = titleText;
                }
            }

            if (matchedClassName) {
                const classInfo = this.classesByName.get(matchedClassName)!;
                g.classList.add('uml-node-interactive');
                g.setAttribute('data-class-name', matchedClassName);
                this.svgNodesByClassName.set(matchedClassName, g);

                g.addEventListener('click', (ev: MouseEvent) => {
                    this.handleClassNodeClick(ev, classInfo);
                });
            }
        }

        if (this.selectedClassInfo) {
            this.setSelectedNode(this.selectedClassInfo.name);
        }
        if (this.currentActiveClassName) {
            this.setActiveEditorNode(this.currentActiveClassName, false);
        }
    }

    private handleClassNodeClick(event: MouseEvent, classInfo: UmlClassInfo): void {
        if (this.hasMovedSignificantly) return;

        event.stopPropagation();

        const target = event.target as SVGElement;
        const clickedText = target?.textContent?.trim() || '';

        let matchedMember: UmlMemberInfo | undefined;
        if (clickedText) {
            for (const [memberName, memberInfo] of classInfo.members.entries()) {
                if (clickedText.includes(memberName)) {
                    matchedMember = memberInfo;
                    break;
                }
            }
        }

        this.setSelectedNode(classInfo.name);

        if (matchedMember) {
            if (!classInfo.isImported) {
                this.openEditMemberModal(classInfo.name, matchedMember);
            }
            this.nodeSelect.emit({
                type: matchedMember.kind,
                name: matchedMember.name,
                className: classInfo.name,
                importSource: classInfo.importSource,
                lineNumber: matchedMember.startLine,
                column: matchedMember.startColumn
            });
        } else {
            this.nodeSelect.emit({
                type: classInfo.isImported ? 'import' : classInfo.kind,
                name: classInfo.name,
                className: classInfo.name,
                importSource: classInfo.importSource,
                lineNumber: classInfo.startLine,
                column: classInfo.startColumn
            });
        }
    }

    // --- Construtor e Edição Visual de Código ---
    public openNewClassModal(): void {
        this.newClassData = {
            name: '',
            kind: 'class',
            extendsClass: '',
            implementsInterface: ''
        };
        this.isNewClassModalOpen = true;
        this.cdr.markForCheck();
    }

    public confirmCreateNewClass(): void {
        const name = this.newClassData.name.trim();
        if (!name) return;

        let code = this.javascriptCode || '';
        let snippet = '\n\n';

        if (this.newClassData.kind === 'interface') {
            const ext = this.newClassData.extendsClass?.trim() ? ` extends ${this.newClassData.extendsClass.trim()}` : '';
            snippet += `export interface ${name}${ext} {\n}\n`;
        } else {
            const isAbs = this.newClassData.kind === 'abstract' ? 'abstract ' : '';
            const ext = this.newClassData.extendsClass?.trim() ? ` extends ${this.newClassData.extendsClass.trim()}` : '';
            const impl = this.newClassData.implementsInterface?.trim() ? ` implements ${this.newClassData.implementsInterface.trim()}` : '';
            snippet += `export ${isAbs}class ${name}${ext}${impl} {\n}\n`;
        }

        this.isNewClassModalOpen = false;
        this.emitCodeChange(code + snippet);
    }

    public openEditClassModal(className: string): void {
        const classInfo = this.classesByName.get(className);
        if (!classInfo || classInfo.isImported) return;

        let ext = '';
        let impl = '';
        const code = this.javascriptCode || '';
        const lines = code.split('\n');
        const declLine = lines[classInfo.startLine - 1] || '';

        const extMatch = declLine.match(/extends\s+([a-zA-Z0-9_]+)/);
        if (extMatch) ext = extMatch[1];

        const implMatch = declLine.match(/implements\s+([^{]+)/);
        if (implMatch) impl = implMatch[1].trim();

        this.editClassData = {
            originalName: className,
            name: className,
            kind: classInfo.kind === 'interface' ? 'interface' : (classInfo.isAbstract ? 'abstract' : 'class'),
            extendsClass: ext,
            implementsInterface: impl,
            startLine: classInfo.startLine,
            endLine: classInfo.endLine
        };

        this.isEditClassModalOpen = true;
        this.cdr.markForCheck();
    }

    public confirmEditClass(): void {
        const orig = this.editClassData.originalName.trim();
        const newName = this.editClassData.name.trim();
        if (!orig || !newName) return;

        const code = this.javascriptCode || '';
        const lines = code.split('\n');
        const startIdx = this.editClassData.startLine - 1;

        if (startIdx >= 0 && startIdx < lines.length) {
            let line = lines[startIdx];
            const isInterface = this.editClassData.kind === 'interface';
            const isAbstract = this.editClassData.kind === 'abstract';
            const ext = this.editClassData.extendsClass?.trim() ? ` extends ${this.editClassData.extendsClass.trim()}` : '';
            const impl = (this.editClassData.implementsInterface?.trim() && !isInterface)
                ? ` implements ${this.editClassData.implementsInterface.trim()}`
                : '';

            const entityKw = isInterface ? 'interface' : (isAbstract ? 'abstract class' : 'class');
            const hasExport = /export\s+/.test(line);
            const exportPrefix = hasExport ? 'export ' : '';
            const hasBrace = line.includes('{');

            lines[startIdx] = `${exportPrefix}${entityKw} ${newName}${ext}${impl}${hasBrace ? ' {' : ''}`;

            this.selectedClassInfo = null;
            this.isEditClassModalOpen = false;
            this.emitCodeChange(lines.join('\n'));
        }
    }

    public openNewRelationshipModal(sourceClassName?: string): void {
        const localClasses = Array.from(this.classesByName.values()).filter(c => !c.isImported);
        const defaultSource = sourceClassName || (localClasses[0]?.name || '');

        this.relationshipData = {
            sourceClassName: defaultSource,
            targetClassName: '',
            relationType: 'association',
            memberName: ''
        };

        this.isRelationshipModalOpen = true;
        this.cdr.markForCheck();
    }

    public confirmCreateRelationship(): void {
        const src = this.relationshipData.sourceClassName.trim();
        const tgt = this.relationshipData.targetClassName.trim();
        if (!src || !tgt) return;

        const classInfo = this.classesByName.get(src);
        if (!classInfo || classInfo.isImported) return;

        const code = this.javascriptCode || '';
        const lines = code.split('\n');
        const startIdx = classInfo.startLine - 1;
        let declLine = lines[startIdx] || '';

        if (this.relationshipData.relationType === 'extends') {
            if (/extends\s+[a-zA-Z0-9_]+/.test(declLine)) {
                declLine = declLine.replace(/extends\s+[a-zA-Z0-9_]+/, `extends ${tgt}`);
            } else {
                const openBraceIdx = declLine.indexOf('{');
                if (openBraceIdx > -1) {
                    declLine = declLine.slice(0, openBraceIdx).trim() + ` extends ${tgt} {`;
                } else {
                    declLine = declLine.trim() + ` extends ${tgt}`;
                }
            }
            lines[startIdx] = declLine;
            this.isRelationshipModalOpen = false;
            this.emitCodeChange(lines.join('\n'));
            return;
        }

        if (this.relationshipData.relationType === 'implements') {
            if (/implements\s+/.test(declLine)) {
                declLine = declLine.replace(/implements\s+([^{]+)/, (_m, cur) => `implements ${cur.trim()}, ${tgt} `);
            } else {
                const openBraceIdx = declLine.indexOf('{');
                if (openBraceIdx > -1) {
                    declLine = declLine.slice(0, openBraceIdx).trim() + ` implements ${tgt} {`;
                } else {
                    declLine = declLine.trim() + ` implements ${tgt}`;
                }
            }
            lines[startIdx] = declLine;
            this.isRelationshipModalOpen = false;
            this.emitCodeChange(lines.join('\n'));
            return;
        }

        if (this.relationshipData.relationType === 'association') {
            const memberName = this.relationshipData.memberName.trim() || `${tgt.charAt(0).toLowerCase() + tgt.slice(1)}`;
            const propLine = `    public ${memberName}: ${tgt};`;
            let insertIdx = startIdx + 1;
            for (let i = startIdx; i < lines.length; i++) {
                if (lines[i].includes('{')) {
                    insertIdx = i + 1;
                    break;
                }
            }
            lines.splice(insertIdx, 0, propLine);
            this.isRelationshipModalOpen = false;
            this.emitCodeChange(lines.join('\n'));
            return;
        }

        if (this.relationshipData.relationType === 'injection') {
            const memberName = this.relationshipData.memberName.trim() || `${tgt.charAt(0).toLowerCase() + tgt.slice(1)}`;
            let constructorLineIdx = -1;
            for (let i = startIdx; i < Math.min(lines.length, classInfo.endLine); i++) {
                if (/constructor\s*\(/.test(lines[i])) {
                    constructorLineIdx = i;
                    break;
                }
            }

            if (constructorLineIdx > -1) {
                let cLine = lines[constructorLineIdx];
                if (cLine.includes('()')) {
                    lines[constructorLineIdx] = cLine.replace('()', `(private ${memberName}: ${tgt})`);
                } else if (cLine.includes('(')) {
                    lines[constructorLineIdx] = cLine.replace('(', `(private ${memberName}: ${tgt}, `);
                }
            } else {
                let insertIdx = startIdx + 1;
                for (let i = startIdx; i < lines.length; i++) {
                    if (lines[i].includes('{')) {
                        insertIdx = i + 1;
                        break;
                    }
                }
                const ctorSnippet = `    constructor(\n        private ${memberName}: ${tgt}\n    ) {}\n`;
                lines.splice(insertIdx, 0, ctorSnippet);
            }

            this.isRelationshipModalOpen = false;
            this.emitCodeChange(lines.join('\n'));
            return;
        }
    }

    public openAddPropertyModal(className: string): void {
        this.memberModalMode = 'add';
        this.memberTargetClassName = className;
        this.memberData = {
            kind: 'property',
            name: '',
            type: 'string',
            visibility: 'public',
            isStatic: false,
            params: '',
            loc: null
        };
        this.isMemberModalOpen = true;
        this.cdr.markForCheck();
    }

    public openAddMethodModal(className: string): void {
        this.memberModalMode = 'add';
        this.memberTargetClassName = className;
        this.memberData = {
            kind: 'method',
            name: '',
            type: 'void',
            visibility: 'public',
            isStatic: false,
            params: '',
            loc: null
        };
        this.isMemberModalOpen = true;
        this.cdr.markForCheck();
    }

    public openEditMemberModal(className: string, member: UmlMemberInfo): void {
        this.memberModalMode = 'edit';
        this.memberTargetClassName = className;
        this.memberData = {
            kind: member.kind,
            name: member.name,
            type: member.type || (member.kind === 'property' ? 'any' : 'void'),
            visibility: member.visibility,
            isStatic: member.isStatic,
            params: member.params || '',
            loc: { startLine: member.startLine, endLine: member.endLine }
        };
        this.isMemberModalOpen = true;
        this.cdr.markForCheck();
    }

    public confirmSaveMember(): void {
        if (!this.memberData.name.trim()) return;

        if (this.memberModalMode === 'add') {
            this.addMemberToClass(this.memberTargetClassName, this.memberData);
        } else if (this.memberModalMode === 'edit' && this.memberData.loc) {
            this.updateExistingMember(this.memberData.loc, this.memberData);
        }

        this.isMemberModalOpen = false;
        this.cdr.markForCheck();
    }

    public confirmDeleteMember(): void {
        if (this.memberData.loc) {
            this.deleteExistingMember(this.memberData.loc);
        }
        this.isMemberModalOpen = false;
        this.cdr.markForCheck();
    }

    public confirmDeleteClass(className: string): void {
        if (!confirm(`Deseja realmente remover a classe '${className}' do código?`)) return;

        const classInfo = this.classesByName.get(className);
        if (!classInfo || classInfo.isImported) return;

        const code = this.javascriptCode || '';
        const lines = code.split('\n');

        const startIdx = classInfo.startLine - 1;
        const deleteCount = Math.max(1, classInfo.endLine - classInfo.startLine + 1);

        lines.splice(startIdx, deleteCount);
        this.selectedClassInfo = null;
        this.emitCodeChange(lines.join('\n'));
    }

    public goToCode(line?: number): void {
        if (!line) return;
        this.nodeSelect.emit({
            type: 'class',
            name: this.selectedClassInfo?.name || '',
            lineNumber: line,
            column: 1
        });
    }

    public closeModals(): void {
        this.isNewClassModalOpen = false;
        this.isEditClassModalOpen = false;
        this.isRelationshipModalOpen = false;
        this.isMemberModalOpen = false;
        this.cdr.markForCheck();
    }

    private addMemberToClass(className: string, member: typeof this.memberData): void {
        const classInfo = this.classesByName.get(className);
        if (!classInfo || classInfo.isImported) return;

        const code = this.javascriptCode || '';
        const lines = code.split('\n');

        let insertLineIdx = -1;
        for (let i = classInfo.startLine - 1; i < lines.length; i++) {
            if (lines[i].includes('{')) {
                insertLineIdx = i + 1;
                break;
            }
        }

        if (insertLineIdx === -1) {
            insertLineIdx = classInfo.startLine;
        }

        const vis = member.visibility === 'private' ? 'private ' : (member.visibility === 'protected' ? 'protected ' : 'public ');
        const stat = member.isStatic ? 'static ' : '';

        let memberLine = '';
        if (member.kind === 'property') {
            const propType = member.type ? `: ${member.type}` : '';
            memberLine = `    ${vis}${stat}${member.name}${propType};`;
        } else {
            const retType = member.type ? `: ${member.type}` : ': void';
            const params = member.params || '';
            memberLine = `    ${vis}${stat}${member.name}(${params})${retType} {\n        // TODO: implementar\n    }\n`;
        }

        lines.splice(insertLineIdx, 0, memberLine);
        this.emitCodeChange(lines.join('\n'));
    }

    private updateExistingMember(loc: { startLine: number, endLine: number }, member: typeof this.memberData): void {
        const code = this.javascriptCode || '';
        const lines = code.split('\n');

        const vis = member.visibility === 'private' ? 'private ' : (member.visibility === 'protected' ? 'protected ' : 'public ');
        const stat = member.isStatic ? 'static ' : '';

        let replacement = '';
        if (member.kind === 'property') {
            const propType = member.type ? `: ${member.type}` : '';
            replacement = `    ${vis}${stat}${member.name}${propType};`;
        } else {
            const retType = member.type ? `: ${member.type}` : ': void';
            const params = member.params || '';
            replacement = `    ${vis}${stat}${member.name}(${params})${retType} {\n        // TODO: implementar\n    }`;
        }

        const startIdx = loc.startLine - 1;
        const deleteCount = Math.max(1, loc.endLine - loc.startLine + 1);

        lines.splice(startIdx, deleteCount, replacement);
        this.emitCodeChange(lines.join('\n'));
    }

    private deleteExistingMember(loc: { startLine: number, endLine: number }): void {
        const code = this.javascriptCode || '';
        const lines = code.split('\n');

        const startIdx = loc.startLine - 1;
        const deleteCount = Math.max(1, loc.endLine - loc.startLine + 1);

        lines.splice(startIdx, deleteCount);
        this.emitCodeChange(lines.join('\n'));
    }

    private emitCodeChange(newCode: string): void {
        this.javascriptCode = newCode;
        this.codeChange.emit(newCode);
        this.scheduleRender();
    }

    // --- Enquadramento e Exportação de Diagramas (SVG, PNG e PDF) ---
    public getFramedSvgElement(): { svgElement: SVGElement, width: number, height: number } | null {
        const svg = this.mermaidContainerRef?.nativeElement?.querySelector('svg');
        if (!svg) return null;

        const liveZoomGroup = svg.querySelector('.mermaid-vector-root') as SVGGraphicsElement;
        let bbox = { x: 0, y: 0, width: this.diagramNaturalWidth || 800, height: this.diagramNaturalHeight || 600 };

        if (liveZoomGroup && typeof liveZoomGroup.getBBox === 'function') {
            try {
                const b = liveZoomGroup.getBBox();
                if (b && b.width > 0 && b.height > 0) {
                    bbox = { x: b.x, y: b.y, width: b.width, height: b.height };
                }
            } catch { }
        }

        const padding = 36;
        const x = Math.floor(bbox.x - padding);
        const y = Math.floor(bbox.y - padding);
        const width = Math.ceil(bbox.width + padding * 2);
        const height = Math.ceil(bbox.height + padding * 2);

        const clone = svg.cloneNode(true) as SVGElement;
        const cloneZoomGroup = clone.querySelector('.mermaid-vector-root');
        if (cloneZoomGroup) {
            cloneZoomGroup.removeAttribute('transform');
        }

        clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
        clone.setAttribute('width', `${width}`);
        clone.setAttribute('height', `${height}`);
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        clone.style.overflow = 'visible';

        clone.querySelectorAll('.uml-node-selected, .uml-node-active').forEach(el => {
            el.classList.remove('uml-node-selected', 'uml-node-active');
        });

        // Adiciona fundo uniforme escuro para compatibilidade em qualquer visualizador
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', `${x}`);
        bgRect.setAttribute('y', `${y}`);
        bgRect.setAttribute('width', `${width}`);
        bgRect.setAttribute('height', `${height}`);
        bgRect.setAttribute('fill', '#1e1e1e');
        clone.insertBefore(bgRect, clone.firstChild);

        return { svgElement: clone, width, height };
    }

    public exportSvg(): void {
        const framed = this.getFramedSvgElement();
        if (!framed) return;

        const svgData = new XMLSerializer().serializeToString(framed.svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const baseName = (this.filePath ? this.filePath.split('/').pop()?.replace(/\.ts$/, '') : 'diagrama');
        const fileName = `${baseName}.uml.svg`;

        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    }

    public exportPng(): void {
        const framed = this.getFramedSvgElement();
        if (!framed) return;

        const svgData = new XMLSerializer().serializeToString(framed.svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const scaleFactor = 2; // Alta resolução (2x)
            const canvas = document.createElement('canvas');
            canvas.width = framed.width * scaleFactor;
            canvas.height = framed.height * scaleFactor;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#1e1e1e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (!blob) return;
                    const pngUrl = URL.createObjectURL(blob);
                    const baseName = (this.filePath ? this.filePath.split('/').pop()?.replace(/\.ts$/, '') : 'diagrama');
                    const fileName = `${baseName}.uml.png`;

                    const link = document.createElement('a');
                    link.href = pngUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(pngUrl);
                    URL.revokeObjectURL(svgUrl);
                }, 'image/png');
            } else {
                URL.revokeObjectURL(svgUrl);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            console.error('Falha ao renderizar SVG para imagem PNG.');
        };
        img.src = svgUrl;
    }

    public exportPdf(): void {
        const framed = this.getFramedSvgElement();
        const svgHtml = framed ? new XMLSerializer().serializeToString(framed.svgElement) : '';
        const code = this.javascriptCode || '';
        const baseName = (this.filePath ? this.filePath.split('/').pop() : 'arquivo.ts');
        const fullPath = this.filePath || 'Arquivo Local';
        const dateStr = new Date().toLocaleString('pt-BR');

        // Compilação de documentação JSDoc e tabela de símbolos
        const classesList = Array.from(this.classesByName.values());
        let symbolsDocHtml = '';

        for (const c of classesList) {
            const jsdoc = c.jsdoc;
            const desc = jsdoc?.description ? `<p class="entity-desc">${this.escapeHtml(jsdoc.description)}</p>` : '';
            let tagsHtml = '';
            if (jsdoc?.tags && jsdoc.tags.length > 0) {
                tagsHtml = `<div class="entity-tags">` + jsdoc.tags.map(t => 
                    `<span class="tag-badge ${t.tag === 'deprecated' ? 'tag-deprecated' : ''}">@${this.escapeHtml(t.tag)} ${this.escapeHtml(t.name || '')} ${this.escapeHtml(t.text || '')}</span>`
                ).join(' ') + `</div>`;
            }

            let membersHtml = '';
            if (c.members.size > 0) {
                membersHtml += `
                <table class="members-table">
                    <thead>
                        <tr>
                            <th>Visibilidade</th>
                            <th>Tipo</th>
                            <th>Nome</th>
                            <th>Retorno / Parâmetros</th>
                            <th>JSDoc</th>
                        </tr>
                    </thead>
                    <tbody>
                `;
                for (const m of c.members.values()) {
                    const mDesc = m.jsdoc?.description ? this.escapeHtml(m.jsdoc.description) : '-';
                    const mType = m.kind === 'method' ? `(${m.params || ''}) => ${m.type || 'void'}` : (m.type || 'any');
                    membersHtml += `
                        <tr>
                            <td><span class="vis-${m.visibility}">${m.visibility}</span></td>
                            <td>${m.kind}</td>
                            <td><strong>${this.escapeHtml(m.name)}</strong>${m.isStatic ? ' <em>(static)</em>' : ''}</td>
                            <td><code>${this.escapeHtml(mType)}</code></td>
                            <td>${mDesc}</td>
                        </tr>
                    `;
                }
                membersHtml += `</tbody></table>`;
            }

            symbolsDocHtml += `
            <div class="entity-card">
                <div class="entity-header">
                    <span class="entity-kind-badge ${c.kind}">${c.kind}</span>
                    <h3 class="entity-title">${this.escapeHtml(c.name)}</h3>
                    ${c.isImported ? '<span class="imported-badge">Importado</span>' : ''}
                </div>
                ${desc}
                ${tagsHtml}
                ${membersHtml}
            </div>
            `;
        }

        const codeLines = code.split('\n');
        const codeLinesHtml = codeLines.map((line, idx) => 
            `<tr><td class="line-num">${idx + 1}</td><td class="line-code">${this.escapeHtml(line) || '&nbsp;'}</td></tr>`
        ).join('');

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${this.escapeHtml(baseName || 'diagrama')} - Compilação UML e Código</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 10mm;
        }
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #222222;
            background: #ffffff;
            margin: 0;
            padding: 16px;
            font-size: 11pt;
            line-height: 1.4;
        }
        .report-header {
            border-bottom: 2px solid #007acc;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .report-header h1 {
            margin: 0 0 6px 0;
            color: #007acc;
            font-size: 18pt;
        }
        .report-meta {
            font-size: 9pt;
            color: #666666;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        .report-meta strong { color: #333333; }
        
        .section-title {
            color: #1e1e1e;
            font-size: 14pt;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 4px;
            margin: 24px 0 12px 0;
            break-after: avoid;
        }
        
        .diagram-container {
            width: 100%;
            text-align: center;
            background: #1e1e1e;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 24px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.15);
            page-break-inside: avoid;
        }
        .diagram-container svg {
            max-width: 100%;
            height: auto;
            max-height: 230mm;
        }
        
        .page-break {
            break-before: page;
            page-break-before: always;
        }
        
        .entity-card {
            border: 1px solid #dddddd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 16px;
            background: #fafafa;
            page-break-inside: avoid;
        }
        .entity-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }
        .entity-kind-badge {
            font-size: 8pt;
            text-transform: uppercase;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 3px;
            background: #e1f0fa;
            color: #007acc;
        }
        .entity-kind-badge.interface {
            background: #e8f5e9;
            color: #2e7d32;
        }
        .entity-title {
            margin: 0;
            font-size: 12pt;
            color: #222222;
        }
        .imported-badge {
            font-size: 8pt;
            color: #888888;
            border: 1px solid #cccccc;
            padding: 1px 5px;
            border-radius: 3px;
        }
        .entity-desc {
            margin: 4px 0 8px 0;
            font-size: 10pt;
            color: #444444;
            font-style: italic;
        }
        .entity-tags {
            margin-bottom: 8px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .tag-badge {
            font-size: 8pt;
            background: #eee;
            padding: 2px 6px;
            border-radius: 3px;
            color: #555;
        }
        .tag-deprecated {
            background: #ffebee;
            color: #c62828;
            font-weight: bold;
        }
        
        .members-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            margin-top: 8px;
        }
        .members-table th, .members-table td {
            border: 1px solid #e0e0e0;
            padding: 4px 8px;
            text-align: left;
        }
        .members-table th {
            background: #eeeeee;
            font-weight: 600;
        }
        .vis-public { color: #2e7d32; font-weight: bold; }
        .vis-private { color: #c62828; }
        .vis-protected { color: #ef6c00; }
        
        .code-table {
            width: 100%;
            border-collapse: collapse;
            font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
            font-size: 8.5pt;
            line-height: 1.35;
            background: #fafafa;
            border: 1px solid #e0e0e0;
        }
        .code-table td {
            padding: 1px 6px;
            vertical-align: top;
        }
        .line-num {
            width: 45px;
            text-align: right;
            color: #999999;
            user-select: none;
            border-right: 1px solid #e0e0e0;
            background: #f0f0f0;
        }
        .line-code {
            white-space: pre-wrap;
            word-break: break-all;
            color: #24292e;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>${this.escapeHtml(baseName || 'diagrama')}</h1>
        <div class="report-meta">
            <span><strong>Caminho:</strong> ${this.escapeHtml(fullPath)}</span>
            <span><strong>Gerado em:</strong> ${dateStr}</span>
            <span><strong>Entidades:</strong> ${classesList.length}</span>
        </div>
    </div>

    <h2 class="section-title">1. Diagrama de Classes UML</h2>
    <div class="diagram-container">
        ${svgHtml}
    </div>

    ${symbolsDocHtml ? `
    <div class="page-break"></div>
    <h2 class="section-title">2. Metadados e Documentação JSDoc</h2>
    ${symbolsDocHtml}
    ` : ''}

    <div class="page-break"></div>
    <h2 class="section-title">3. Código-Fonte Compilado</h2>
    <table class="code-table">
        <tbody>
            ${codeLinesHtml}
        </tbody>
    </table>
</body>
</html>
        `;

        const printWin = window.open('', '_blank', 'width=1100,height=850');
        if (printWin) {
            printWin.document.open();
            printWin.document.write(htmlContent);
            printWin.document.close();
            setTimeout(() => {
                printWin.focus();
                printWin.print();
            }, 450);
        }
    }

    private escapeHtml(text: string): string {
        return (text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // --- Alternar Diagrama Geral com Dependências ---
    public toggleGeneralDiagram(): void {
        this.showGeneralDiagram = !this.showGeneralDiagram;
        this.classesByName.clear();
        this.svgNodesByClassName.clear();
        this.selectedClassInfo = null;
        this.lastRenderedCode = null;
        this.renderDiagram();
    }

    // --- Controles de Zoom ---
    zoomIn(): void {
        const viewport = this.viewportRef?.nativeElement;
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const newScale = Math.min(10, this.scale * 1.25);
        this.translateX = centerX - (centerX - this.translateX) * (newScale / this.scale);
        this.translateY = centerY - (centerY - this.translateY) * (newScale / this.scale);
        this.scale = newScale;
        this.scheduleApplyTransform();
    }

    zoomOut(): void {
        const viewport = this.viewportRef?.nativeElement;
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const newScale = Math.max(0.1, this.scale * 0.8);
        this.translateX = centerX - (centerX - this.translateX) * (newScale / this.scale);
        this.translateY = centerY - (centerY - this.translateY) * (newScale / this.scale);
        this.scale = newScale;
        this.scheduleApplyTransform();
    }

    resetView(): void {
        this.fitToViewport();
    }

    // --- Manipulação de Pan e Zoom Vetorial sem Rasterização ---
    private handleMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) return;

        if ((event.target as HTMLElement).closest('.uml-controls, .error-overlay, .uml-class-action-bar, .uml-modal-backdrop, button, select, input')) {
            return;
        }

        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.hasMovedSignificantly = false;

        this.startX = event.clientX - this.translateX;
        this.startY = event.clientY - this.translateY;

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    };

    private handleMouseMove = (event: MouseEvent) => {
        const dist = Math.hypot(event.clientX - this.dragStartX, event.clientY - this.dragStartY);
        if (dist > 5) {
            this.hasMovedSignificantly = true;
            if (!this.isDragging) {
                this.isDragging = true;
                this.viewportRef.nativeElement.classList.add('grabbing');
            }
        }

        if (this.isDragging) {
            this.translateX = event.clientX - this.startX;
            this.translateY = event.clientY - this.startY;
            this.scheduleApplyTransform();
        }
    };

    private handleMouseUp = () => {
        if (this.isDragging) {
            this.isDragging = false;
            this.viewportRef.nativeElement.classList.remove('grabbing');
        }
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    };

    private handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        const viewport = this.viewportRef.nativeElement;
        const rect = viewport.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const zoomFactor = event.deltaY < 0 ? 1.15 : (1 / 1.15);
        const newScale = Math.max(0.1, Math.min(10, this.scale * zoomFactor));

        if (newScale === this.scale) return;

        this.translateX = mouseX - (mouseX - this.translateX) * (newScale / this.scale);
        this.translateY = mouseY - (mouseY - this.translateY) * (newScale / this.scale);
        this.scale = newScale;

        this.scheduleApplyTransform();
    };

    private handleTouchStart = (event: TouchEvent) => {
        if ((event.target as HTMLElement).closest('.uml-controls, .error-overlay, .uml-class-action-bar, .uml-modal-backdrop, button')) return;

        if (event.touches.length === 1) {
            this.isDragging = true;
            this.startX = event.touches[0].clientX - this.translateX;
            this.startY = event.touches[0].clientY - this.translateY;
            this.lastTouchDist = 0;
        } else if (event.touches.length === 2) {
            this.isDragging = false;
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.lastTouchDist = Math.hypot(dx, dy);
        }
    };

    private handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length === 1 && this.isDragging) {
            event.preventDefault();
            this.translateX = event.touches[0].clientX - this.startX;
            this.translateY = event.touches[0].clientY - this.startY;
            this.scheduleApplyTransform();
        } else if (event.touches.length === 2) {
            event.preventDefault();
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            const dist = Math.hypot(dx, dy);

            if (this.lastTouchDist > 0) {
                const viewport = this.viewportRef.nativeElement;
                const rect = viewport.getBoundingClientRect();
                const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
                const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;

                const factor = dist / this.lastTouchDist;
                const newScale = Math.max(0.1, Math.min(10, this.scale * factor));

                this.translateX = midX - (midX - this.translateX) * (newScale / this.scale);
                this.translateY = midY - (midY - this.translateY) * (newScale / this.scale);
                this.scale = newScale;

                this.scheduleApplyTransform();
            }
            this.lastTouchDist = dist;
        }
    };

    private handleTouchEnd = (event: TouchEvent) => {
        if (event.touches.length === 0) {
            this.isDragging = false;
            this.lastTouchDist = 0;
        } else if (event.touches.length === 1) {
            this.isDragging = true;
            this.startX = event.touches[0].clientX - this.translateX;
            this.startY = event.touches[0].clientY - this.translateY;
            this.lastTouchDist = 0;
        }
    };

    private scheduleApplyTransform(): void {
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.applyTransform();
        });
    }

    private applyTransform(): void {
        const zoomGroup = this.mermaidContainerRef?.nativeElement?.querySelector('.mermaid-vector-root') as SVGElement;
        if (zoomGroup) {
            zoomGroup.setAttribute('transform',
                `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`
            );
        }
    }

    public fitToViewport(): void {
        const viewport = this.viewportRef?.nativeElement;
        if (!viewport) return;

        const vpRect = viewport.getBoundingClientRect();
        if (vpRect.width <= 0 || vpRect.height <= 0) return;

        const zoomGroup = this.mermaidContainerRef?.nativeElement?.querySelector('.mermaid-vector-root') as SVGGraphicsElement;
        if (!zoomGroup) return;

        let bx = 0;
        let by = 0;
        let bw = this.diagramNaturalWidth || 800;
        let bh = this.diagramNaturalHeight || 600;

        if (typeof zoomGroup.getBBox === 'function') {
            try {
                const bbox = zoomGroup.getBBox();
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                    bx = bbox.x;
                    by = bbox.y;
                    bw = bbox.width;
                    bh = bbox.height;
                }
            } catch { }
        }

        const padding = 64;
        const availableW = Math.max(vpRect.width - padding, 40);
        const availableH = Math.max(vpRect.height - padding, 40);

        const scaleX = availableW / bw;
        const scaleY = availableH / bh;
        this.scale = Math.max(0.15, Math.min(Math.min(scaleX, scaleY), 1.2));

        const centerX = bx + bw / 2;
        const centerY = by + bh / 2;

        this.translateX = (vpRect.width / 2) - (centerX * this.scale);
        this.translateY = (vpRect.height / 2) - (centerY * this.scale);

        this.applyTransform();
    }

    // --- Renderização do Diagrama com Debounce e Extração AST ---
    private scheduleRender(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        if (this.javascriptCode === this.lastRenderedCode && !this.error) {
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = null;
            this.renderDiagram();
        }, 350);
    }

    private async renderDiagram(): Promise<void> {
        if (!this.javascriptCode?.trim()) {
            if (this.mermaidContainerRef?.nativeElement) {
                this.mermaidContainerRef.nativeElement.innerHTML = '';
            }
            this.error = null;
            this.lastRenderedCode = null;
            this.classesByName.clear();
            this.svgNodesByClassName.clear();
            this.selectedClassInfo = null;
            this.cdr.markForCheck();
            return;
        }

        const currentSeq = ++this.renderSeq;
        const codeToRender = this.javascriptCode;

        try {
            let code_for_generate_diagram = codeToRender;
            const trimmed = codeToRender.trim();

            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    const json_parsed = JSON.parse(trimmed);
                    if (json_parsed) {
                        code_for_generate_diagram = this.jsonToTs.convert(trimmed);
                    }
                } catch { }
            }

            const mermaidSyntax = await this.generateMermaidClassDiagram(code_for_generate_diagram);

            const id = `mermaid_svg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const { svg } = await mermaid.render(id, mermaidSyntax);

            if (this.renderSeq !== currentSeq) {
                return;
            }

            this.error = null;
            this.lastRenderedCode = codeToRender;

            if (this.mermaidContainerRef?.nativeElement) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svg, 'image/svg+xml');
                const svgEl = doc.querySelector('svg');

                if (svgEl) {
                    const viewBoxAttr = svgEl.getAttribute('viewBox');
                    if (viewBoxAttr) {
                        const parts = viewBoxAttr.split(/\s+/).map(Number);
                        if (parts.length === 4) {
                            this.diagramNaturalWidth = parts[2];
                            this.diagramNaturalHeight = parts[3];
                        }
                    }

                    // Remove viewBox e preserveAspectRatio da raiz SVG para garantir
                    // que 1 unidade no zoomGroup seja exatamente 1 pixel CSS na viewport,
                    // permitindo centralização matemática absoluta sem deslocamentos.
                    svgEl.removeAttribute('viewBox');
                    svgEl.removeAttribute('preserveAspectRatio');
                    svgEl.setAttribute('width', '100%');
                    svgEl.setAttribute('height', '100%');
                    svgEl.style.width = '100%';
                    svgEl.style.height = '100%';
                    svgEl.style.overflow = 'hidden';

                    const zoomGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
                    zoomGroup.setAttribute('class', 'mermaid-vector-root');

                    const children = Array.from(svgEl.childNodes);
                    for (const child of children) {
                        const tag = child.nodeName.toLowerCase();
                        if (tag !== 'defs' && tag !== 'style') {
                            zoomGroup.appendChild(child);
                        }
                    }
                    svgEl.appendChild(zoomGroup);

                    this.mermaidContainerRef.nativeElement.innerHTML = svgEl.outerHTML;
                    this.applyTransform();
                    this.bindSvgInteractions();
                }
            }

            this.cdr.markForCheck();

            if (this.shouldAutoFit) {
                this.shouldAutoFit = false;
                requestAnimationFrame(() => {
                    this.fitToViewport();
                });
            }

        } catch (err: any) {
            if (this.renderSeq !== currentSeq) return;

            const errorMsg = err?.message || 'Falha ao converter código em UML.';
            this.error = errorMsg;
            this.cdr.markForCheck();
        }
    }

    private async generateMermaidClassDiagram(code: string): Promise<string> {
        try {
            const ast = babelParser.parse(code, {
                sourceType: 'module',
                plugins: ['typescript', 'decorators-legacy', 'jsx', 'moduleBlocks'],
                errorRecovery: true,
            });

            this.classesByName.clear();
            this.packagesBySource.clear();

            let classBlocks = '';
            let relationships = '';
            let hasClassesOrInterfaces = false;

            const fileImports = new Map<string, { source: string, line: number, column: number, importedName?: string }>();
            const usedImports = new Map<string, string>();

            const body = ast.program.body;

            for (const node of body) {
                if (node.type === 'ImportDeclaration') {
                    const source = node.source.value;
                    const line = node.loc?.start.line || 1;
                    const column = node.loc?.start.column || 1;

                    for (const specifier of node.specifiers) {
                        if (specifier.local && specifier.local.name) {
                            const importedName = (specifier as any).imported?.name || specifier.local.name;
                            fileImports.set(specifier.local.name, {
                                source,
                                line: specifier.loc?.start.line || line,
                                column: specifier.loc?.start.column || column,
                                importedName
                            });
                        }
                    }
                }
            }

            const getType = (typeNode: any): string => {
                if (!typeNode) return '';
                const t = typeNode.typeAnnotation || typeNode;

                switch (t.type) {
                    case 'TSStringKeyword': return 'String';
                    case 'TSNumberKeyword': return 'Number';
                    case 'TSBooleanKeyword': return 'Boolean';
                    case 'TSAnyKeyword': return 'Any';
                    case 'TSVoidKeyword': return 'Void';
                    case 'TSTypeReference': {
                        let name = t.typeName?.name || 'Unknown';
                        if (t.typeParameters && t.typeParameters.params) {
                            const params = t.typeParameters.params.map(getType).join(', ');
                            name += `~${params}~`;
                        }
                        return name;
                    }
                    case 'TSArrayType': return `${getType(t.elementType)}[]`;
                    case 'TSUnionType': return t.types.map(getType).join('|');
                    default: return '';
                }
            };

            const getVisibility = (acc: string): 'public' | 'private' | 'protected' => {
                if (acc === 'private') return 'private';
                if (acc === 'protected') return 'protected';
                return 'public';
            };

            const getVisibilitySymbol = (acc: 'public' | 'private' | 'protected'): string => {
                if (acc === 'private') return '-';
                if (acc === 'protected') return '#';
                return '+';
            };

            const findIdentifiers = (node: any, found: Set<string>) => {
                if (!node || typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    for (const item of node) findIdentifiers(item, found);
                    return;
                }
                if (node.type === 'Identifier' && node.name) {
                    found.add(node.name);
                }
                for (const key of Object.keys(node)) {
                    if (!['loc', 'range', 'tokens', 'comments'].includes(key)) {
                        findIdentifiers(node[key], found);
                    }
                }
            };

            const parseJsDoc = (comments?: any[]): UmlJsDocInfo | undefined => {
                if (!comments || !comments.length) return undefined;
                const jsdocComment = comments.slice().reverse().find(c =>
                    (c.type === 'CommentBlock' || c.type === 'Block') && c.value && c.value.startsWith('*')
                );
                if (!jsdocComment) return undefined;

                const raw = jsdocComment.value;
                const lines = raw.split('\n').map((l: string) => l.replace(/^\s*\*\s?/, '').trim());

                const descLines: string[] = [];
                const tags: UmlJsDocTag[] = [];

                for (const line of lines) {
                    if (line.startsWith('@')) {
                        const match = line.match(/^@([a-zA-Z0-9_-]+)(?:\s+(?:\{([^}]+)\}\s+)?([^\s]+))?(?:\s+(.*))?$/);
                        if (match) {
                            tags.push({
                                tag: match[1],
                                type: match[2] || '',
                                name: match[3] || '',
                                text: (match[4] || '').trim()
                            });
                        } else {
                            const simple = line.match(/^@([a-zA-Z0-9_-]+)(?:\s+(.*))?$/);
                            if (simple) {
                                tags.push({
                                    tag: simple[1],
                                    text: (simple[2] || '').trim()
                                });
                            }
                        }
                    } else if (tags.length === 0 && line.length > 0) {
                        descLines.push(line);
                    }
                }

                const description = descLines.join(' ').trim();
                if (!description && tags.length === 0) return undefined;

                return { description, tags };
            };

            for (const node of body) {
                const classNode =
                    node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration'
                        ? (node.declaration as any)
                        : node;

                if (!classNode) continue;

                const isClass = classNode.type === 'ClassDeclaration';
                const isInterface = classNode.type === 'TSInterfaceDeclaration';

                if (isClass || isInterface) {
                    hasClassesOrInterfaces = true;
                    const className = classNode.id?.name || 'AnonymousEntity';
                    const classLoc = classNode.loc || { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } };
                    const classComments = (node.leadingComments && node.leadingComments.length ? node.leadingComments : classNode.leadingComments);
                    const classJsDoc = parseJsDoc(classComments);

                    const classInfo: UmlClassInfo = {
                        name: className,
                        kind: isInterface ? 'interface' : 'class',
                        isAbstract: !!classNode.abstract,
                        isImported: false,
                        startLine: classLoc.start.line,
                        startColumn: classLoc.start.column,
                        endLine: classLoc.end.line,
                        endColumn: classLoc.end.column,
                        members: new Map(),
                        jsdoc: classJsDoc
                    };

                    let classBlock = `  class ${className} {\n`;
                    const classConnections = new Set<string>();

                    if (isInterface) {
                        classBlock += `    <<Interface>>\n`;
                    } else if (classNode.abstract) {
                        classBlock += `    <<Abstract>>\n`;
                    }

                    if (classJsDoc) {
                        if (classJsDoc.description) {
                            const cleanDesc = classJsDoc.description.replace(/"/g, "'").replace(/\r?\n/g, ' ').slice(0, 110);
                            relationships += `  note for ${className} "JSDoc: ${cleanDesc}"\n`;
                        }
                        if (classJsDoc.tags.some(t => t.tag === 'deprecated')) {
                            classBlock += `    <<Deprecated>>\n`;
                        }
                    }

                    if (isClass && classNode.superClass && classNode.superClass.type === 'Identifier') {
                        const superName = classNode.superClass.name;
                        relationships += `  ${superName} <|-- ${className}\n`;
                        classConnections.add(superName);
                    }

                    if (isInterface && classNode.extends) {
                        for (const ext of classNode.extends) {
                            if (ext.expression && ext.expression.type === 'Identifier') {
                                const superName = ext.expression.name;
                                relationships += `  ${superName} <|-- ${className}\n`;
                                classConnections.add(superName);
                            }
                        }
                    }

                    if (isClass && classNode.implements) {
                        for (const impl of classNode.implements) {
                            if (impl.type === 'TSExpressionWithTypeArguments' && impl.expression.type === 'Identifier') {
                                const interfaceName = impl.expression.name;
                                relationships += `  ${interfaceName} <|.. ${className}\n`;
                                classConnections.add(interfaceName);
                            }
                        }
                    }

                    const members = classNode.body?.body || [];

                    for (const member of members) {
                        const visibility = getVisibility(member.accessibility);
                        const visSymbol = getVisibilitySymbol(visibility);
                        const modifier = member.static ? '$' : (member.abstract ? '*' : '');

                        const isProperty = member.type === 'ClassProperty' || member.type === 'TSPropertySignature';
                        const isMethod = member.type === 'ClassMethod' || member.type === 'TSMethodSignature';
                        const memberLoc = member.loc;

                        if (isProperty && member.key.type === 'Identifier') {
                            const propName = member.key.name;
                            const typeStr = getType(member.typeAnnotation);
                            const typePrefix = typeStr ? `${typeStr} ` : '';

                            const propJsDoc = parseJsDoc(member.leadingComments);

                            if (memberLoc) {
                                classInfo.members.set(propName, {
                                    name: propName,
                                    kind: 'property',
                                    type: typeStr || 'any',
                                    visibility,
                                    isStatic: !!member.static,
                                    startLine: memberLoc.start.line,
                                    startColumn: memberLoc.start.column,
                                    endLine: memberLoc.end.line,
                                    endColumn: memberLoc.end.column,
                                    jsdoc: propJsDoc
                                });
                            }

                            classBlock += `    ${visSymbol}${typePrefix}${propName}${modifier}\n`;

                            if (typeStr && /^[A-Z]/.test(typeStr) && !['String', 'Number', 'Boolean', 'Any', 'Void'].includes(typeStr)) {
                                const cleanType = typeStr.replace(/\[\]/g, '').replace(/~.*~/g, '');
                                if (cleanType && cleanType !== className) {
                                    relationships += `  ${className} --> ${cleanType} : ${propName}\n`;
                                    classConnections.add(cleanType);
                                }
                            }
                        } else if (isMethod) {
                            const isConstructor = member.kind === 'constructor';
                            const methodName = isConstructor ? 'constructor' : (member.key.name || 'method');

                            const rawReturnType = member.returnType || member.typeAnnotation;
                            const returnType = isConstructor ? '' : getType(rawReturnType);
                            const returnSuffix = returnType ? ` ${returnType}` : '';

                            const methodParams = member.params || member.parameters || [];

                            const paramStrings: string[] = [];
                            const params = methodParams.map((p: any) => {
                                let pName = 'param';
                                let pType = '';

                                if (p.type === 'TSParameterProperty') {
                                    pName = p.parameter.name;
                                    pType = getType(p.parameter.typeAnnotation);
                                } else if (p.type === 'Identifier') {
                                    pName = p.name;
                                    pType = getType(p.typeAnnotation);
                                } else if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') {
                                    pName = p.left.name;
                                    pType = getType(p.left.typeAnnotation);
                                }

                                const fullParam = pType ? `${pName}: ${pType}` : pName;
                                paramStrings.push(fullParam);

                                if (isConstructor && pType && /^[A-Z]/.test(pType)) {
                                    const cleanType = pType.replace(/\[\]/g, '').replace(/~.*~/g, '');
                                    if (cleanType && cleanType !== className) {
                                        relationships += `  ${className} ..> ${cleanType} : injects\n`;
                                        classConnections.add(cleanType);
                                    }
                                }

                                return pType ? `${pType} ${pName}` : pName;
                            }).join(', ');

                            const methodJsDoc = parseJsDoc(member.leadingComments);

                            if (memberLoc) {
                                classInfo.members.set(methodName, {
                                    name: methodName,
                                    kind: 'method',
                                    type: returnType || 'void',
                                    visibility,
                                    isStatic: !!member.static,
                                    params: paramStrings.join(', '),
                                    startLine: memberLoc.start.line,
                                    startColumn: memberLoc.start.column,
                                    endLine: memberLoc.end.line,
                                    endColumn: memberLoc.end.column,
                                    jsdoc: methodJsDoc
                                });
                            }

                            classBlock += `    ${visSymbol}${methodName}(${params})${modifier}${returnSuffix}\n`;
                        }
                    }

                    classBlock += `  }\n`;
                    classBlocks += classBlock;

                    this.classesByName.set(className, classInfo);

                    const identifiersInClass = new Set<string>();
                    findIdentifiers(classNode, identifiersInClass);

                    fileImports.forEach((meta, importName) => {
                        try {
                            if (identifiersInClass.has(importName)) {
                                usedImports.set(importName, meta.source);
                                if (!classConnections.has(importName)) {
                                    relationships += `  ${className} ..> ${importName} : use\n`;
                                    classConnections.add(importName);
                                }
                            }
                        } catch (error) {
                            console.trace(error);
                        }
                    });
                }
            }

            if (!hasClassesOrInterfaces) {
                throw new Error('Nenhuma classe ou interface TypeScript encontrada no arquivo.');
            }

            // Agrupa imports utilizados por pacote/namespace
            const packages = new Map<string, string[]>();

            usedImports.forEach((source, importName) => {
                try {
                    const isRelative = source.startsWith('.');
                    const packageName = isRelative ? 'Main' : source;

                    if (!packages.has(packageName)) {
                        packages.set(packageName, []);
                    }
                    packages.get(packageName)!.push(importName);
                    this.packagesBySource.set(source, packageName);
                } catch (error) {
                    console.trace(error);
                }
            });

            // Metadados carregados de arquivos TS locais (Visão Geral com tsconfig)
            const loadedModulesCache = new Map<string, string>();
            const externalParsedClasses = new Map<string, { block: string, info: UmlClassInfo }>();

            if (this.showGeneralDiagram && this.workspaceService) {
                const uniqueSources = new Set(Array.from(usedImports.values()));

                for (const source of uniqueSources) {
                    try {
                        const moduleData = await this.workspaceService.loadTsModuleContent(source, this.filePath || undefined);
                        if (moduleData && moduleData.content) {
                            loadedModulesCache.set(source, moduleData.content);

                            const depAst = babelParser.parse(moduleData.content, {
                                sourceType: 'module',
                                plugins: ['typescript', 'decorators-legacy', 'jsx', 'moduleBlocks'],
                                errorRecovery: true,
                            });

                            for (const node of depAst.program.body) {
                                const classNode =
                                    node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration'
                                        ? (node.declaration as any)
                                        : node;

                                if (!classNode) continue;
                                const isClass = classNode.type === 'ClassDeclaration';
                                const isInterface = classNode.type === 'TSInterfaceDeclaration';

                                if (isClass || isInterface) {
                                    const depClassName = classNode.id?.name;
                                    if (!depClassName || !usedImports.has(depClassName)) continue;

                                    const classLoc = classNode.loc || { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } };
                                    const depClassInfo: UmlClassInfo = {
                                        name: depClassName,
                                        kind: isInterface ? 'interface' : 'class',
                                        isAbstract: !!classNode.abstract,
                                        isImported: true,
                                        importSource: moduleData.path,
                                        startLine: classLoc.start.line,
                                        startColumn: classLoc.start.column,
                                        endLine: classLoc.end.line,
                                        endColumn: classLoc.end.column,
                                        members: new Map()
                                    };

                                    let depBlock = `    class ${depClassName} {\n`;
                                    if (isInterface) {
                                        depBlock += `      <<Interface>>\n`;
                                    } else if (classNode.abstract) {
                                        depBlock += `      <<Abstract>>\n`;
                                    }

                                    const members = classNode.body?.body || [];
                                    for (const member of members) {
                                        const visibility = getVisibility(member.accessibility);
                                        const visSymbol = getVisibilitySymbol(visibility);
                                        const modifier = member.static ? '$' : (member.abstract ? '*' : '');
                                        const isProperty = member.type === 'ClassProperty' || member.type === 'TSPropertySignature';
                                        const isMethod = member.type === 'ClassMethod' || member.type === 'TSMethodSignature';
                                        const memberLoc = member.loc;

                                        if (isProperty && member.key?.type === 'Identifier') {
                                            const propName = member.key.name;
                                            const typeStr = getType(member.typeAnnotation);
                                            const typePrefix = typeStr ? `${typeStr} ` : '';

                                            if (memberLoc) {
                                                depClassInfo.members.set(propName, {
                                                    name: propName,
                                                    kind: 'property',
                                                    type: typeStr || 'any',
                                                    visibility,
                                                    isStatic: !!member.static,
                                                    startLine: memberLoc.start.line,
                                                    startColumn: memberLoc.start.column,
                                                    endLine: memberLoc.end.line,
                                                    endColumn: memberLoc.end.column
                                                });
                                            }
                                            depBlock += `      ${visSymbol}${typePrefix}${propName}${modifier}\n`;
                                        } else if (isMethod) {
                                            const isConstructor = member.kind === 'constructor';
                                            const methodName = isConstructor ? 'constructor' : (member.key?.name || 'method');
                                            const rawReturnType = member.returnType || member.typeAnnotation;
                                            const returnType = isConstructor ? '' : getType(rawReturnType);
                                            const returnSuffix = returnType ? ` ${returnType}` : '';

                                            const methodParams = member.params || member.parameters || [];
                                            const paramStrings: string[] = [];
                                            const params = methodParams.map((p: any) => {
                                                let pName = 'param';
                                                let pType = '';
                                                if (p.type === 'TSParameterProperty') {
                                                    pName = p.parameter.name;
                                                    pType = getType(p.parameter.typeAnnotation);
                                                } else if (p.type === 'Identifier') {
                                                    pName = p.name;
                                                    pType = getType(p.typeAnnotation);
                                                }
                                                paramStrings.push(pType ? `${pName}: ${pType}` : pName);
                                                return pType ? `${pType} ${pName}` : pName;
                                            }).join(', ');

                                            if (memberLoc) {
                                                depClassInfo.members.set(methodName, {
                                                    name: methodName,
                                                    kind: 'method',
                                                    type: returnType || 'void',
                                                    visibility,
                                                    isStatic: !!member.static,
                                                    params: paramStrings.join(', '),
                                                    startLine: memberLoc.start.line,
                                                    startColumn: memberLoc.start.column,
                                                    endLine: memberLoc.end.line,
                                                    endColumn: memberLoc.end.column
                                                });
                                            }
                                            depBlock += `      ${visSymbol}${methodName}(${params})${modifier}${returnSuffix}\n`;
                                        }
                                    }

                                    depBlock += `    }\n`;
                                    externalParsedClasses.set(depClassName, { block: depBlock, info: depClassInfo });
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Não foi possível carregar metadados completos de:', source, e);
                    }
                }
            }

            let importBlocks = '';

            packages.forEach((classes, pkgName) => {
                try {
                    const safePkgName = pkgName.replace(/[^a-zA-Z0-9_]/g, '_');

                    importBlocks += `  namespace ${safePkgName} {\n`;
                    classes.forEach(className => {
                        const parsedExt = externalParsedClasses.get(className);
                        if (parsedExt) {
                            importBlocks += parsedExt.block;
                            this.classesByName.set(className, parsedExt.info);
                        } else {
                            importBlocks += `    class ${className} {\n  }\n`;

                            const importMeta = fileImports.get(className);
                            this.classesByName.set(className, {
                                name: className,
                                kind: 'class',
                                isImported: true,
                                importSource: importMeta?.source || pkgName,
                                startLine: importMeta?.line || 1,
                                startColumn: importMeta?.column || 1,
                                endLine: importMeta?.line || 1,
                                endColumn: importMeta?.column || 1,
                                members: new Map()
                            });
                        }
                    });
                    importBlocks += `  }\n`;
                } catch (error) {
                    console.trace(error);
                }
            });

            const mermaidConfig = `%%{init: {"useMaxWidth": false, "theme": "default"}}%%`;

            return `${mermaidConfig}\nclassDiagram\n${classBlocks}\n${importBlocks}\n${relationships}`;
        } catch (error: any) {
            if (error?.message?.includes('Nenhuma classe ou interface')) {
                throw error;
            }
            console.trace('Falha ao gerar diagrama:', error);
            throw new Error('Falha ao converter código em UML.');
        }
    }
}