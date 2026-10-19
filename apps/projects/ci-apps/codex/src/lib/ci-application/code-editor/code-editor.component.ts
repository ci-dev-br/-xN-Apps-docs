import { Component, Input, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreModule } from '@ci/core';
import { FileDto, FileExplorerService, ReadDirectoryOutput } from '@ci/portal-api';
import { NuMonacoEditorEvent, NuMonacoEditorModel, NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { lastValueFrom, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UmlViewer, UmlNodeSelectEvent } from '../uml-viewer/uml-viewer';
import { MonacoWorkspaceService } from './monaco-workspace.service';
import { FloatingWindow, FloatingEditorManagerComponent } from '../floating-editor';

declare const monaco: any;

@Component({
    selector: 'ci-code-editor',
    standalone: true,
    imports: [
        CoreModule,
        NuMonacoEditorModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        BreadcrumbComponent,
        MatInputModule,
        MatFormFieldModule,
        UmlViewer,
        FloatingEditorManagerComponent,
    ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent implements OnDestroy {
    @ViewChild('editorContainer') editorContainerRef?: ElementRef<HTMLDivElement>;

    fullscreen = false;
    mostrarUml = false;
    viewMode: 'editor' | 'split' | 'uml-canvas' = 'editor';
    umlPanelWidth = 520;
    private isResizingSplitter = false;
    private splitterStartX = 0;
    private splitterStartWidth = 520;
    floatingWindows: FloatingWindow[] = [];

    // Navegação de pastas no modo UML Tela Cheia
    isFolderNavOpen = false;
    currentDirectory = '';
    directoryItems: ReadDirectoryOutput[] = [];
    isLoadingDirectory = false;
    isMappingFolder = false;
    isFolderOverviewActive = false;
    backupSingleFileCode: string | null = null;
    folderSearchTerm = '';

    carregando = true;
    oppenedFile?: FileDto;
    commitDescription = '';

    @Input() language?: string;
    value?: string;
    originalValue?: string;
    isDirty = false;

    // Métricas da barra de status
    cursorLine = 1;
    cursorColumn = 1;
    errorCount = 0;
    warningCount = 0;

    // Documentação de módulos instalados
    mostrarDocs = false;
    carregandoDocs = false;
    installedPackages: any[] = [];
    selectedPackageDoc: any = null;
    docSearchTerm = '';
    filteredSymbols: any[] = [];

    editorModel?: NuMonacoEditorModel;
    monacoInstance?: any;
    editorInstance?: any;

    editorOptions: any = {
        theme: 'vs-dark',
        wordWrap: 'on',
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
        fontSize: 14,
        tabSize: 2,
        renderLineHighlight: 'all',
        fixedOverflowWidgets: true,
        contextmenu: true,
        quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
        },
        parameterHints: { enabled: true },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
    };

    private routeSub?: Subscription;
    private editorDisposables: any[] = [];
    private pendingPosition?: { lineNumber: number, column: number };
    private highlightDecorationIds: string[] = [];

    constructor(
        private readonly fileExplorer: FileExplorerService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly workspaceService: MonacoWorkspaceService,
    ) {
        this.routeSub = this.activatedRoute.queryParams.subscribe(async (query: any) => {
            if (query.file && query.file !== this.oppenedFile?.path) {
                await this.abrirArquivo(query.file);
            }
        });
    }

    /**
     * Carrega o arquivo via FileExplorerService e alimenta o Monaco Editor
     */
    async abrirArquivo(filePath: string, targetPosition?: { lineNumber: number, column: number }) {
        if (!filePath) return;

        let cleanPath = filePath.replace(/\\/g, '/');
        if (/^\/[a-zA-Z]:/.test(cleanPath)) {
            cleanPath = cleanPath.substring(1);
        } else {
            cleanPath = cleanPath.replace(/^\/+/, '');
        }

        const normalizedLower = cleanPath.toLowerCase();
        const repoMarker = 'br.dev.ci.apps/';
        const markerIdx = normalizedLower.indexOf(repoMarker);
        if (markerIdx > -1) {
            cleanPath = cleanPath.substring(markerIdx + repoMarker.length);
        }

        // Se o arquivo solicitado já está aberto e temos apenas uma posição para pular:
        if (cleanPath === this.oppenedFile?.path && this.editorInstance && targetPosition) {
            this.editorInstance.setPosition(targetPosition);
            this.editorInstance.revealPositionInCenter(targetPosition);
            this.editorInstance.focus();
            return;
        }

        const isFirstLoad = !this.editorInstance;
        if (isFirstLoad) {
            this.carregando = true;
        }

        try {
            const file_loaded = await lastValueFrom(this.fileExplorer.readFile({
                body: { path: cleanPath }
            }));
            this.oppenedFile = file_loaded;
            this.value = (file_loaded.data as string) || '';
            this.originalValue = this.value;
            this.isDirty = false;

            const detectedLanguage = this.detectLanguage(cleanPath);
            this.selectLanguage(detectedLanguage);

            const activeMonaco = this.getMonacoInstance();

            // Configura o modelo virtual do Monaco com o caminho real do arquivo
            this.editorModel = this.workspaceService.getOrCreateModel(
                cleanPath,
                this.value,
                detectedLanguage,
                activeMonaco
            );

            // Troca o modelo diretamente no editor ativo mantendo o componente vivo
            if (this.editorInstance && activeMonaco && this.editorModel?.uri) {
                const targetMonacoModel = activeMonaco.editor.getModel(this.editorModel.uri);
                if (targetMonacoModel && this.editorInstance.getModel() !== targetMonacoModel) {
                    this.editorInstance.setModel(targetMonacoModel);
                }
            }

            // Se for TypeScript ou JavaScript, consome o backend para carregar dependências e tipagens
            if (detectedLanguage === 'typescript' || detectedLanguage === 'javascript') {
                this.workspaceService.setupTypeScript(activeMonaco);
                await this.workspaceService.carregarRecursosArquivo(
                    cleanPath,
                    this.value,
                    activeMonaco
                );

                if (this.mostrarDocs) {
                    this.carregarDocumentacaoModulos();
                }
            }

            // Posiciona o cursor no destino
            const pos = targetPosition || this.pendingPosition;
            if (pos && this.editorInstance) {
                setTimeout(() => {
                    if (this.editorInstance) {
                        this.editorInstance.setPosition(pos);
                        this.editorInstance.revealPositionInCenter(pos);
                        this.editorInstance.focus();
                    }
                }, 50);
                this.pendingPosition = undefined;
            }
        } catch (e) {
            console.error("Erro ao carregar arquivo via FileExplorerService:", e);
        } finally {
            if (isFirstLoad) {
                this.carregando = false;
            }
        }
    }

    /**
     * Trata eventos de ciclo de vida emitidos pelo nu-monaco-editor
     */
    async onEditorEvent(event: NuMonacoEditorEvent) {
        if (event.type === 'init') {
            this.editorInstance = event.editor;
            this.monacoInstance = this.getMonacoInstance();

            this.registrarIntegracoesMonaco();

            if (this.oppenedFile?.path && this.value) {
                const lang = this.detectLanguage(this.oppenedFile.path);
                this.editorModel = this.workspaceService.getOrCreateModel(
                    this.oppenedFile.path,
                    this.value,
                    lang,
                    this.monacoInstance
                );

                if (this.editorModel?.uri) {
                    const m = this.monacoInstance.editor.getModel(this.editorModel.uri);
                    if (m && this.editorInstance.getModel() !== m) {
                        this.editorInstance.setModel(m);
                    }
                }

                if (lang === 'typescript' || lang === 'javascript') {
                    this.workspaceService.setupTypeScript(this.monacoInstance);
                    await this.workspaceService.carregarRecursosArquivo(
                        this.oppenedFile.path,
                        this.value,
                        this.monacoInstance
                    );
                }

                if (this.pendingPosition) {
                    this.editorInstance.setPosition(this.pendingPosition);
                    this.editorInstance.revealPositionInCenter(this.pendingPosition);
                    this.editorInstance.focus();
                    this.pendingPosition = undefined;
                }
            }
        }
    }

    /**
     * Registra ações, atalhos de teclado e listeners de cursor/diagnósticos
     */
    private registrarIntegracoesMonaco() {
        if (!this.editorInstance || !this.monacoInstance) return;

        // Limpa listeners antigos
        this.limparDisposables();

        // 1. Registra o Opener para Go to Definition entre arquivos diferentes (F12 / Ctrl+Click)
        this.workspaceService.registerDefinitionOpener(async (filePath, selectionOrPosition) => {
            let pos: { lineNumber: number, column: number } | undefined = undefined;
            if (selectionOrPosition) {
                const line = selectionOrPosition.startLineNumber || selectionOrPosition.lineNumber || 1;
                const col = selectionOrPosition.startColumn || selectionOrPosition.column || 1;
                pos = { lineNumber: line, column: col };
                this.pendingPosition = pos;
            }

            let cleanPath = filePath.replace(/\\/g, '/');
            if (/^\/[a-zA-Z]:/.test(cleanPath)) {
                cleanPath = cleanPath.substring(1);
            } else {
                cleanPath = cleanPath.replace(/^\/+/, '');
            }

            const normalizedLower = cleanPath.toLowerCase();
            const repoMarker = 'br.dev.ci.apps/';
            const markerIdx = normalizedLower.indexOf(repoMarker);
            if (markerIdx > -1) {
                cleanPath = cleanPath.substring(markerIdx + repoMarker.length);
            }

            await this.abrirArquivo(cleanPath, pos);

            this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: { file: cleanPath },
                queryParamsHandling: 'merge'
            });

            return true;
        }, this.monacoInstance);

        // 2. Atalho F12 para Ir para Definição
        this.editorInstance.addAction({
            id: 'codex.goToDefinition',
            label: 'Ir para a Definição',
            keybindings: [this.monacoInstance.KeyCode.F12],
            run: (ed: any) => ed.getAction('editor.action.revealDefinition')?.run()
        });

        // 3. Atalho Alt+F12 para Espiar Definição
        this.editorInstance.addAction({
            id: 'codex.peekDefinition',
            label: 'Espiar Definição',
            keybindings: [this.monacoInstance.KeyMod.Alt | this.monacoInstance.KeyCode.F12],
            run: (ed: any) => ed.getAction('editor.action.peekDefinition')?.run()
        });

        // 4. Atalho Ctrl+S / Cmd+S para salvar
        this.editorInstance.addAction({
            id: 'codex.save',
            label: 'Salvar Arquivo',
            keybindings: [this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyCode.KeyS],
            run: () => this.confirmar()
        });

        // 5. Atalho Alt+Shift+F para formatar
        this.editorInstance.addAction({
            id: 'codex.format',
            label: 'Formatar Documento',
            keybindings: [this.monacoInstance.KeyMod.Alt | this.monacoInstance.KeyMod.Shift | this.monacoInstance.KeyCode.KeyF],
            run: (ed: any) => ed.getAction('editor.action.formatDocument')?.run()
        });

        // 6. Atalho Shift+F12 para encontrar referências
        this.editorInstance.addAction({
            id: 'codex.findReferences',
            label: 'Localizar Referências',
            keybindings: [this.monacoInstance.KeyMod.Shift | this.monacoInstance.KeyCode.F12],
            run: (ed: any) => ed.getAction('editor.action.referenceSearch.trigger')?.run()
        });

        // 7. Atalho F8 para próximo marcador de erro / aviso
        this.editorInstance.addAction({
            id: 'codex.nextMarker',
            label: 'Ir para Próximo Erro/Aviso',
            keybindings: [this.monacoInstance.KeyCode.F8],
            run: (ed: any) => ed.getAction('editor.action.marker.next')?.run()
        });

        // 8. Atalho Shift+F8 para marcador anterior
        this.editorInstance.addAction({
            id: 'codex.prevMarker',
            label: 'Ir para Erro/Aviso Anterior',
            keybindings: [this.monacoInstance.KeyMod.Shift | this.monacoInstance.KeyCode.F8],
            run: (ed: any) => ed.getAction('editor.action.marker.prev')?.run()
        });

        // 9. Atalho F11 para alternar tela cheia dentro do editor
        this.editorInstance.addAction({
            id: 'codex.toggleFullscreen',
            label: 'Alternar Tela Cheia',
            keybindings: [this.monacoInstance.KeyCode.F11],
            run: () => this.toggleFullscreen()
        });

        // 10. Atalho Alt+D para alternar documentação de módulos instalados
        this.editorInstance.addAction({
            id: 'codex.toggleDocs',
            label: 'Alternar Documentação de Módulos Instalados',
            keybindings: [this.monacoInstance.KeyMod.Alt | this.monacoInstance.KeyCode.KeyD],
            run: () => this.toggleDocs()
        });

        // 8. Listener de mudança de posição do cursor
        const cursorSub = this.editorInstance.onDidChangeCursorPosition((e: any) => {
            if (e?.position) {
                this.cursorLine = e.position.lineNumber;
                this.cursorColumn = e.position.column;
            }
        });
        this.editorDisposables.push(cursorSub);

        // 9. Listener de alteração de conteúdo para controle de dirty state
        const contentSub = this.editorInstance.onDidChangeModelContent(() => {
            this.value = this.editorInstance.getValue();
            this.isDirty = this.value !== this.originalValue;
        });
        this.editorDisposables.push(contentSub);

        // 10. Listener de marcadores de diagnóstico (erros/avisos do TypeScript)
        if (this.monacoInstance?.editor?.onDidChangeMarkers) {
            const markerSub = this.monacoInstance.editor.onDidChangeMarkers(() => {
                this.atualizarDiagnosticos();
            });
            this.editorDisposables.push(markerSub);
        }

        this.atualizarDiagnosticos();
    }

    /**
     * Atualiza os contadores de erros e avisos da barra de status
     */
    private atualizarDiagnosticos() {
        if (!this.monacoInstance?.editor?.getModelMarkers || !this.editorInstance) return;

        const model = this.editorInstance.getModel();
        if (!model) return;

        const markers = this.monacoInstance.editor.getModelMarkers({ resource: model.uri });
        const MarkerSeverity = this.monacoInstance.MarkerSeverity || { Error: 8, Warning: 4 };

        this.errorCount = markers.filter((m: any) => m.severity === MarkerSeverity.Error).length;
        this.warningCount = markers.filter((m: any) => m.severity === MarkerSeverity.Warning).length;
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.fullscreen) {
            this.exitFullscreen();
        }
    }

    @HostListener('document:keydown.f11', ['$event'])
    onF11(event: Event): void {
        event.preventDefault();
        this.toggleFullscreen();
    }

    @HostListener('document:fullscreenchange')
    onFullscreenChange(): void {
        const isNativeFs = typeof document !== 'undefined' && !!document.fullscreenElement;
        if (this.fullscreen !== isNativeFs) {
            this.fullscreen = isNativeFs;
            this.updateBodyClass();
            this.layoutEditor();
        }
    }

    public async toggleFullscreen(): Promise<void> {
        this.fullscreen = !this.fullscreen;
        this.updateBodyClass();

        try {
            if (this.fullscreen) {
                const elem = this.editorContainerRef?.nativeElement;
                if (elem?.requestFullscreen && !document.fullscreenElement) {
                    await elem.requestFullscreen();
                }
            } else {
                if (typeof document !== 'undefined' && document.fullscreenElement) {
                    await document.exitFullscreen();
                }
            }
        } catch {
            // Fallback para tela cheia CSS
        }

        this.layoutEditor();
    }

    public async exitFullscreen(): Promise<void> {
        if (!this.fullscreen) return;
        this.fullscreen = false;
        this.updateBodyClass();

        try {
            if (typeof document !== 'undefined' && document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch { }

        this.layoutEditor();
    }

    private updateBodyClass(): void {
        if (typeof document !== 'undefined') {
            document.body.classList.toggle('codex-fullscreen-active', this.fullscreen);
        }
    }

    public layoutEditor(): void {
        setTimeout(() => {
            if (this.editorInstance) {
                this.editorInstance.layout();
            }
        }, 80);
    }

    // Ações de conveniência da UI
    public goToDefinition(): void {
        this.editorInstance?.getAction('editor.action.revealDefinition')?.run();
    }

    public peekDefinition(): void {
        this.editorInstance?.getAction('editor.action.peekDefinition')?.run();
    }

    public findReferences(): void {
        this.editorInstance?.getAction('editor.action.referenceSearch.trigger')?.run();
    }

    public formatDocument(): void {
        this.editorInstance?.getAction('editor.action.formatDocument')?.run();
    }

    public goToNextError(): void {
        this.editorInstance?.getAction('editor.action.marker.next')?.run();
    }

    public setViewMode(mode: 'editor' | 'split' | 'uml-canvas'): void {
        this.viewMode = mode;
        this.mostrarUml = mode !== 'editor';
        if (this.mostrarUml) {
            this.mostrarDocs = false;
        }
        this.layoutEditor();
    }

    public toggleUml(): void {
        if (this.viewMode === 'editor') {
            this.setViewMode('split');
        } else if (this.viewMode === 'split') {
            this.setViewMode('uml-canvas');
        } else {
            this.setViewMode('editor');
        }
    }

    public onSplitterMouseDown(event: MouseEvent): void {
        if (event.button !== 0) return;
        event.preventDefault();
        this.isResizingSplitter = true;
        this.splitterStartX = event.clientX;
        this.splitterStartWidth = this.umlPanelWidth;

        const onMouseMove = (e: MouseEvent) => {
            if (!this.isResizingSplitter) return;
            const containerWidth = this.editorContainerRef?.nativeElement?.getBoundingClientRect().width || 1200;
            const deltaX = e.clientX - this.splitterStartX;
            const newWidth = Math.max(260, Math.min(containerWidth - 280, this.splitterStartWidth - deltaX));
            this.umlPanelWidth = newWidth;
            this.layoutEditor();
        };

        const onMouseUp = () => {
            this.isResizingSplitter = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            this.layoutEditor();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    // --- Navegação e Mapeamento de Pastas do Projeto no UML Tela Cheia ---
    public async toggleFolderNav(): Promise<void> {
        this.isFolderNavOpen = !this.isFolderNavOpen;
        if (this.isFolderNavOpen && !this.directoryItems.length) {
            let initialDir = '';
            if (this.oppenedFile?.path) {
                const parts = this.oppenedFile.path.replace(/\\/g, '/').split('/');
                parts.pop();
                initialDir = parts.join('/');
            }
            await this.loadDirectory(initialDir || 'apps');
        }
    }

    public async loadDirectory(dirPath: string): Promise<void> {
        this.currentDirectory = (dirPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
        this.isLoadingDirectory = true;
        try {
            const items = await lastValueFrom(
                this.fileExplorer.readDirectory({ body: { path: this.currentDirectory } })
            );
            this.directoryItems = (items || []).slice().sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return (a.name || '').localeCompare(b.name || '');
            });
        } catch (err) {
            console.error('Erro ao ler diretório:', dirPath, err);
            this.directoryItems = [];
        } finally {
            this.isLoadingDirectory = false;
        }
    }

    public async navigateToParentDirectory(): Promise<void> {
        if (!this.currentDirectory) return;
        const parts = this.currentDirectory.split('/');
        parts.pop();
        const parent = parts.join('/');
        await this.loadDirectory(parent);
    }

    public async onDirectoryItemClick(item: ReadDirectoryOutput): Promise<void> {
        if (!item.path) return;
        if (item.isDirectory) {
            await this.loadDirectory(item.path);
        } else if (item.isFile) {
            this.isFolderOverviewActive = false;
            await this.abrirArquivo(item.path);
        }
    }

    public async openInFloatingWindowFromNav(item: ReadDirectoryOutput, event?: Event): Promise<void> {
        event?.stopPropagation();
        if (!item.isFile || !item.path) return;
        await this.openFloatingWindow(item.path, 1, 1, item.name || undefined);
    }

    public async mapCurrentFolderOverview(): Promise<void> {
        let rootDir = this.currentDirectory;
        if (!rootDir && this.oppenedFile?.path) {
            const parts = this.oppenedFile.path.replace(/\\/g, '/').split('/');
            parts.pop();
            rootDir = parts.join('/');
        }
        if (!rootDir) {
            rootDir = 'apps';
        }

        this.isMappingFolder = true;
        try {
            const tsFiles = await this.collectTsFilesRecursively(rootDir, 6, 0);

            if (!tsFiles.length) {
                alert('Nenhum arquivo TypeScript (.ts) encontrado nesta pasta ou subpastas para mapear.');
                return;
            }

            if (!this.backupSingleFileCode) {
                this.backupSingleFileCode = this.value || '';
            }

            const combinedSnippets: string[] = [];
            // Limita a um número seguro para garantir alta performance de parsing e diagrama
            const filesToProcess = tsFiles.slice(0, 60);

            for (const f of filesToProcess) {
                try {
                    const loaded = await lastValueFrom(
                        this.fileExplorer.readFile({ body: { path: f.path! } })
                    );
                    const fileContent = (loaded?.data as string) || '';
                    // Verifica se o arquivo contém declarações relevantes (class ou interface)
                    if (fileContent.trim() && (fileContent.includes('class ') || fileContent.includes('interface '))) {
                        const relPath = f.path!.replace(/\\/g, '/').replace(rootDir.replace(/\\/g, '/') + '/', '');
                        combinedSnippets.push(`// ==========================================\n// Arquivo: ${relPath}\n// ==========================================\n${fileContent}`);
                    }
                } catch (e) {
                    console.warn('Não foi possível ler arquivo para visão geral:', f.path, e);
                }
            }

            if (combinedSnippets.length > 0) {
                this.isFolderOverviewActive = true;
                this.value = combinedSnippets.join('\n\n');
            } else {
                alert('Nenhum arquivo com classes ou interfaces foi encontrado nesta pasta e subpastas.');
            }
        } catch (err) {
            console.error('Erro ao compilar visão geral da pasta:', err);
        } finally {
            this.isMappingFolder = false;
        }
    }

    private async collectTsFilesRecursively(
        dirPath: string,
        maxDepth: number = 6,
        currentDepth: number = 0,
        maxFiles: number = 100
    ): Promise<ReadDirectoryOutput[]> {
        const cleanDir = (dirPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
        const results: ReadDirectoryOutput[] = [];
        const ignoredDirs = new Set(['node_modules', '.git', 'dist', '.angular', '.vscode', 'coverage', '.system_generated', 'bin', 'obj']);

        try {
            const items = await lastValueFrom(
                this.fileExplorer.readDirectory({ body: { path: cleanDir } })
            );

            if (!items || !items.length) return results;

            for (const item of items) {
                if (results.length >= maxFiles) break;

                const itemName = item.name || '';
                const itemPath = (item.path || '').replace(/\\/g, '/');

                if (item.isFile) {
                    const lower = itemName.toLowerCase();
                    if ((lower.endsWith('.ts') || lower.endsWith('.js')) &&
                        !lower.endsWith('.spec.ts') &&
                        !lower.endsWith('.spec.js') &&
                        !lower.endsWith('.d.ts')) {
                        results.push(item);
                    }
                } else if (item.isDirectory && currentDepth < maxDepth) {
                    if (!ignoredDirs.has(itemName.toLowerCase())) {
                        const subFiles = await this.collectTsFilesRecursively(itemPath, maxDepth, currentDepth + 1, maxFiles - results.length);
                        results.push(...subFiles);
                    }
                }
            }
        } catch (err) {
            console.warn('Falha ao ler diretório recursivo:', cleanDir, err);
        }

        return results;
    }

    public restoreSingleFileView(): void {
        if (this.backupSingleFileCode !== null) {
            this.value = this.backupSingleFileCode;
            this.backupSingleFileCode = null;
        }
        this.isFolderOverviewActive = false;
    }

    public get filteredDirectoryItems(): ReadDirectoryOutput[] {
        if (!this.folderSearchTerm.trim()) {
            return this.directoryItems;
        }
        const term = this.folderSearchTerm.trim().toLowerCase();
        return this.directoryItems.filter(i => (i.name || '').toLowerCase().includes(term));
    }

    /**
     * Trata evento de seleção emitido pelo diagrama UML
     */
    public async onUmlNodeSelect(event: UmlNodeSelectEvent): Promise<void> {
        if (!event) return;

        // Se estiver no modo UML Canvas (Diagrama em Tela Cheia), abre o arquivo em janela flutuante com Monaco
        if (this.viewMode === 'uml-canvas') {
            let targetPath = this.oppenedFile?.path || '';
            if (event.importSource) {
                const resolved = await this.resolveImportFilePath(event.importSource);
                if (resolved) {
                    targetPath = resolved;
                } else if (event.importSource.endsWith('.ts') || event.importSource.endsWith('.d.ts')) {
                    targetPath = event.importSource;
                }
            }
            if (targetPath) {
                await this.openFloatingWindow(targetPath, event.lineNumber, event.column, event.name);
            }
            return;
        }

        // 1. Navegação para classe, interface, método ou propriedade no próprio arquivo aberto
        if (event.lineNumber && !event.importSource) {
            if (this.editorInstance) {
                const pos = { lineNumber: event.lineNumber, column: event.column || 1 };
                this.editorInstance.setPosition(pos);
                this.editorInstance.revealLineInCenter(event.lineNumber);
                this.editorInstance.focus();
                this.flashEditorLine(event.lineNumber);
            }
            return;
        }

        // 2. Navegação para arquivo externo / módulo importado
        if (event.importSource) {
            const resolvedPath = await this.resolveImportFilePath(event.importSource);
            const targetPath = resolvedPath || (event.importSource.endsWith('.ts') || event.importSource.endsWith('.d.ts') ? event.importSource : null);
            if (targetPath) {
                await this.abrirArquivo(targetPath, { lineNumber: event.lineNumber || 1, column: event.column || 1 });
            } else if (event.lineNumber && this.editorInstance) {
                // Fallback: se não encontrar o arquivo físico, navega para a linha do import no arquivo atual
                this.editorInstance.setPosition({ lineNumber: event.lineNumber, column: event.column || 1 });
                this.editorInstance.revealLineInCenter(event.lineNumber);
                this.editorInstance.focus();
                this.flashEditorLine(event.lineNumber);
            }
        }
    }

    /**
     * Abre um arquivo em janela modal flutuante com editor Monaco
     */
    public async openFloatingWindow(filePath: string, lineNumber?: number, column?: number, symbolName?: string): Promise<void> {
        if (!filePath) return;

        const normalizedPath = filePath.replace(/\\/g, '/');
        const fileName = normalizedPath.split('/').pop() || 'Arquivo';

        // 1. Se já existir uma janela para este arquivo, restaura e posiciona
        const existing = this.floatingWindows.find(w => w.filePath === normalizedPath);
        if (existing) {
            existing.isMinimized = false;
            existing.lineNumber = lineNumber;
            existing.column = column;
            existing.symbolName = symbolName;
            if (existing.editorInstance && lineNumber && lineNumber > 0) {
                existing.editorInstance.setPosition({ lineNumber, column: column || 1 });
                existing.editorInstance.revealLineInCenter(lineNumber);
                existing.editorInstance.focus();
            }
            return;
        }

        // 2. Obtém conteúdo do arquivo
        let content = '';
        if (this.oppenedFile?.path && normalizedPath === this.oppenedFile.path.replace(/\\/g, '/')) {
            content = this.value || '';
        } else {
            try {
                const fileLoaded = await lastValueFrom(
                    this.fileExplorer.readFile({ body: { path: normalizedPath } })
                );
                if (fileLoaded?.data && typeof fileLoaded.data === 'string') {
                    content = fileLoaded.data;
                }
            } catch (e) {
                console.warn('Erro ao carregar arquivo para janela flutuante:', normalizedPath, e);
                return;
            }
        }

        const offsetIdx = this.floatingWindows.length % 6;
        const startX = 60 + (offsetIdx * 32);
        const startY = 40 + (offsetIdx * 32);

        const detectedLang = normalizedPath.endsWith('.ts') ? 'typescript' : (normalizedPath.endsWith('.js') ? 'javascript' : (normalizedPath.endsWith('.html') ? 'html' : (normalizedPath.endsWith('.scss') || normalizedPath.endsWith('.css') ? 'scss' : 'plaintext')));

        const model = this.workspaceService.getOrCreateModel(
            normalizedPath,
            content,
            detectedLang,
            this.monacoInstance
        );

        const newWin: FloatingWindow = {
            id: `win_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            title: fileName,
            filePath: normalizedPath,
            content,
            originalContent: content,
            language: detectedLang,
            lineNumber,
            column,
            symbolName,
            x: startX,
            y: startY,
            width: 720,
            height: 480,
            isMinimized: false,
            isMaximized: false,
            zIndex: 100 + this.floatingWindows.length,
            isDirty: false,
            model
        };

        this.floatingWindows = [...this.floatingWindows, newWin];
    }

    public closeFloatingWindow(id: string): void {
        this.floatingWindows = this.floatingWindows.filter(w => w.id !== id);
    }

    public async saveFloatingWindow(win: FloatingWindow): Promise<void> {
        if (!win) return;
        try {
            if (this.oppenedFile?.path && win.filePath === this.oppenedFile.path.replace(/\\/g, '/')) {
                this.value = win.content;
                if (this.editorInstance) {
                    this.editorInstance.setValue(win.content);
                }
                await this.confirmar();
                win.isDirty = false;
                win.originalContent = win.content;
            } else {
                await lastValueFrom(
                    this.fileExplorer.readFile({
                        body: {
                            path: win.filePath,
                            data: win.content
                        }
                    })
                );
                win.isDirty = false;
                win.originalContent = win.content;
            }
        } catch (err) {
            console.error('Erro ao salvar arquivo da janela flutuante:', err);
        } finally {
            win.isSaving = false;
        }
    }

    public onFloatingWindowCodeChange(event: { window: FloatingWindow; code: string }): void {
        if (!event.window) return;
        if (this.oppenedFile?.path && event.window.filePath === this.oppenedFile.path.replace(/\\/g, '/')) {
            this.value = event.code;
            this.isDirty = this.value !== this.originalValue;
        }
    }

    public bringWindowToFront(win: FloatingWindow): void {
        // zIndex é gerenciado pelo componente FloatingEditorManagerComponent
    }

    /**
     * Trata alterações de código originadas pela edição visual no diagrama UML
     */
    public onUmlCodeChange(newCode: string): void {
        if (!newCode || newCode === this.value) return;
        this.value = newCode;
        if (this.editorInstance) {
            this.editorInstance.setValue(newCode);
        }
        this.isDirty = this.value !== this.originalValue;
    }

    /**
     * Destaca visualmente a linha selecionada no Monaco Editor por alguns instantes
     */
    private flashEditorLine(lineNumber: number, endLineNumber?: number): void {
        if (!this.editorInstance || !this.monacoInstance) return;

        const maxCol = this.editorInstance.getModel()?.getLineMaxColumn(endLineNumber || lineNumber) || 100;
        const range = new this.monacoInstance.Range(
            lineNumber,
            1,
            endLineNumber || lineNumber,
            maxCol
        );

        this.highlightDecorationIds = this.editorInstance.deltaDecorations(this.highlightDecorationIds, [
            {
                range,
                options: {
                    isWholeLine: true,
                    className: 'monaco-uml-highlight-line',
                    glyphMarginClassName: 'monaco-uml-glyph-marker'
                }
            }
        ]);

        setTimeout(() => {
            if (this.editorInstance) {
                this.highlightDecorationIds = this.editorInstance.deltaDecorations(this.highlightDecorationIds, []);
            }
        }, 1800);
    }

    /**
     * Resolve o arquivo físico correspondente ao import (caminhos relativos ou pacotes monorepo)
     */
    private async resolveImportFilePath(importSource: string): Promise<string | null> {
        if (!importSource) return null;

        const currentPath = this.oppenedFile?.path || '';

        // 1. Resolve dinamicamente através do MonacoWorkspaceService (lê tsconfigs de service, apps e workspace)
        const resolvedTsModule = await this.workspaceService.resolveTsModulePath(importSource, currentPath);
        if (resolvedTsModule) {
            return resolvedTsModule;
        }

        // 2. Caminho relativo (ex: ./user.service ou ../models/user)
        if (importSource.startsWith('.')) {
            const lastSlash = currentPath.lastIndexOf('/');
            const baseDir = lastSlash > -1 ? currentPath.substring(0, lastSlash) : '';
            return await this.workspaceService.findResolvedPath(baseDir, importSource);
        }

        // 3. Mapeamento de pacotes internos do workspace monorepo (fallback)
        const workspaceMappings: Record<string, string> = {
            '@ci-apps/Arquivos': 'apps/projects/ci-apps/arquivos/src/public-api.ts',
            '@ci-apps/Cadastros': 'apps/projects/ci-apps/cadastros/src/public-api.ts',
            '@ci-apps/Codex': 'apps/projects/ci-apps/codex/src/public-api.ts',
            '@ci-apps/DevTools': 'apps/projects/ci-apps/dev-tools/src/public-api.ts',
            '@ci-apps/Dynamic': 'apps/projects/ci-apps/dynamic/src/public-api.ts',
            '@ci-apps/Financeiro': 'apps/projects/ci-apps/financeiro/src/public-api.ts',
            '@ci-apps/Formularios': 'apps/projects/ci-apps/formularios/src/public-api.ts',
            '@ci-apps/Gerencial': 'apps/projects/ci-apps/gerencial/src/public-api.ts',
            '@ci-apps/Icons': 'apps/projects/ci-apps/icons/src/public-api.ts',
            '@ci-apps/Imersao': 'apps/projects/ci-apps/imersao/src/public-api.ts',
            '@ci-apps/Infra': 'apps/projects/ci-apps/infra/src/public-api.ts',
            '@ci-apps/Instalacao': 'apps/projects/ci-apps/instalacao/src/public-api.ts',
            '@ci-apps/LowCode': 'apps/projects/ci-apps/low-code/src/public-api.ts',
            '@ci-apps/Mensagens': 'apps/projects/ci-apps/mensagens/src/public-api.ts',
            '@ci-apps/Organizacao': 'apps/projects/ci-apps/organizacao/src/public-api.ts',
            '@ci-apps/Produtos': 'apps/projects/ci-apps/produtos/src/public-api.ts',
            '@ci-apps/Profile': 'apps/projects/ci-apps/profile/src/public-api.ts',
            '@ci-apps/Projetos': 'apps/projects/ci-apps/projetos/src/public-api.ts',
            '@ci-apps/SEO': 'apps/projects/ci-apps/seo/src/public-api.ts',
            '@ci-apps/Threejs': 'apps/projects/ci-apps/threejs/src/public-api.ts',
            '@ci-apps/Treinamento': 'apps/projects/ci-apps/treinamento/src/public-api.ts',
            '@ci-apps/Vendas': 'apps/projects/ci-apps/vendas/src/public-api.ts',
            '@ci/portal-api': 'apps/projects/ci/portal-api/src/public-api.ts',
            '@ci/core': 'apps/projects/ci/core/src/public-api.ts',
            '@ci/cdk': 'apps/projects/ci/cdk/src/public-api.ts',
        };

        if (workspaceMappings[importSource]) {
            return workspaceMappings[importSource];
        }

        for (const [pkg, target] of Object.entries(workspaceMappings)) {
            if (importSource.startsWith(pkg + '/')) {
                const subPath = importSource.substring(pkg.length + 1);
                const baseDir = target.substring(0, target.lastIndexOf('/'));
                const resolved = await this.workspaceService.findResolvedPath(baseDir, `./${subPath}`);
                if (resolved) return resolved;
            }
        }

        return null;
    }

    public async toggleDocs(): Promise<void> {
        this.mostrarDocs = !this.mostrarDocs;
        if (this.mostrarDocs) {
            this.mostrarUml = false;
            await this.carregarDocumentacaoModulos();
        }
        this.layoutEditor();
    }

    public async carregarDocumentacaoModulos(): Promise<void> {
        if (!this.oppenedFile?.path) return;
        this.carregandoDocs = true;
        try {
            const res = await this.workspaceService.getInstalledPackages(this.oppenedFile.path, this.value);
            this.installedPackages = res?.packages || [];
            const firstUsed = this.installedPackages.find(p => p.isUsedInFile) || this.installedPackages[0];
            if (firstUsed) {
                await this.selecionarPacote(firstUsed.name);
            }
        } catch (err) {
            console.error('Erro ao carregar documentação de módulos:', err);
        } finally {
            this.carregandoDocs = false;
        }
    }

    public async selecionarPacote(pkgName: string): Promise<void> {
        if (!pkgName) return;
        this.carregandoDocs = true;
        try {
            const doc = await this.workspaceService.getPackageDocumentation(pkgName, this.oppenedFile?.path);
            this.selectedPackageDoc = doc;
            this.filtrarSimbolosDoc();
        } catch (err) {
            console.error('Erro ao carregar pacote:', pkgName, err);
        } finally {
            this.carregandoDocs = false;
        }
    }

    public filtrarSimbolosDoc(): void {
        if (!this.selectedPackageDoc?.exportedSymbols) {
            this.filteredSymbols = [];
            return;
        }
        const term = (this.docSearchTerm || '').trim().toLowerCase();
        if (!term) {
            this.filteredSymbols = this.selectedPackageDoc.exportedSymbols;
        } else {
            this.filteredSymbols = this.selectedPackageDoc.exportedSymbols.filter((s: any) =>
                s.name.toLowerCase().includes(term) ||
                s.kind.toLowerCase().includes(term) ||
                (s.documentation && s.documentation.toLowerCase().includes(term))
            );
        }
    }

    public async abrirDeclaracaoSimbolo(sym: any): Promise<void> {
        if (!sym?.dtsPath) return;
        let clean = sym.dtsPath.replace(/\\/g, '/');
        if (/^\/[a-zA-Z]:/.test(clean)) {
            clean = clean.substring(1);
        } else {
            clean = clean.replace(/^\/+/, '');
        }
        const normalizedLower = clean.toLowerCase();
        const repoMarker = 'br.dev.ci.apps/';
        const markerIdx = normalizedLower.indexOf(repoMarker);
        if (markerIdx > -1) {
            clean = clean.substring(markerIdx + repoMarker.length);
        }

        await this.abrirArquivo(clean, { lineNumber: sym.line || 1, column: sym.column || 1 });
    }

    private getMonacoInstance(): any {
        return typeof monaco !== 'undefined' ? monaco : (window as any).monaco;
    }

    private detectLanguage(filePath: string): string {
        const lower = filePath.toLowerCase();
        if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
        if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
        if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
        if (lower.endsWith('.scss')) return 'scss';
        if (lower.endsWith('.css')) return 'css';
        if (lower.endsWith('.json')) return 'json';
        if (lower.endsWith('.md')) return 'markdown';
        if (lower.endsWith('.xml') || lower.endsWith('.svg')) return 'xml';
        if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
        if (lower.endsWith('.sql')) return 'sql';
        if (lower.endsWith('.sh') || lower.endsWith('.ps1')) return 'shell';
        return 'plaintext';
    }

    async selectLanguage(language?: string) {
        this.language = language;
        this.editorOptions = { ...this.editorOptions, language: language };
    }

    async confirmar() {
        if (!this.oppenedFile?.path) return;

        try {
            await lastValueFrom(
                this.fileExplorer.readFile({
                    body: {
                        ...this.oppenedFile,
                        data: this.value
                    }
                })
            );
            this.originalValue = this.value;
            this.isDirty = false;
            this.commitDescription = '';
        } catch (err) {
            console.error('Falha ao persistir alterações no arquivo:', err);
        }
    }

    private limparDisposables() {
        for (const d of this.editorDisposables) {
            try {
                d?.dispose?.();
            } catch { }
        }
        this.editorDisposables = [];
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
        this.limparDisposables();
        this.workspaceService.clearWorkspace();
        if (typeof document !== 'undefined') {
            document.body.classList.remove('codex-fullscreen-active');
            if (document.fullscreenElement) {
                try { document.exitFullscreen(); } catch { }
            }
        }
    }
}