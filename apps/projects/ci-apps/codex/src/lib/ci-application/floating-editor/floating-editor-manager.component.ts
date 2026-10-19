import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    NgZone,
    OnDestroy,
    ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NuMonacoEditorEvent, NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { FloatingWindow } from './floating-editor.model';
import { MonacoWorkspaceService } from '../code-editor/monaco-workspace.service';

declare const monaco: any;

@Component({
    selector: 'floating-editor-manager',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NuMonacoEditorModule
    ],
    templateUrl: './floating-editor-manager.component.html',
    styleUrl: './floating-editor-manager.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingEditorManagerComponent implements OnDestroy {
    @Input() windows: FloatingWindow[] = [];
    @Input() editorOptions: any = {
        theme: 'vs-dark',
        fontSize: 13,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderWhitespace: 'none',
        tabSize: 4,
        overviewRulerLanes: 0,
        folding: true,
        wordWrap: 'on'
    };

    @Output() windowClose = new EventEmitter<string>();
    @Output() windowSave = new EventEmitter<FloatingWindow>();
    @Output() windowCodeChange = new EventEmitter<{ window: FloatingWindow; code: string }>();
    @Output() windowFocus = new EventEmitter<FloatingWindow>();

    private topZIndex = 100;
    private activeDraggingWin: FloatingWindow | null = null;
    private activeResizingWin: FloatingWindow | null = null;
    private dragOffset = { x: 0, y: 0 };
    private resizeStart = { x: 0, y: 0, width: 0, height: 0 };

    constructor(
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private hostRef: ElementRef<HTMLElement>,
        private workspaceService: MonacoWorkspaceService
    ) {}

    ngOnDestroy(): void {
        this.removeGlobalDragListeners();
    }

    public bringToFront(win: FloatingWindow): void {
        this.topZIndex += 2;
        win.zIndex = this.topZIndex;
        this.windowFocus.emit(win);
        this.cdr.markForCheck();
    }

    public closeWindow(id: string, event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }
        this.windowClose.emit(id);
    }

    public toggleMinimize(win: FloatingWindow, event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }
        win.isMinimized = !win.isMinimized;
        if (!win.isMinimized) {
            this.bringToFront(win);
            this.scheduleLayout(win);
        }
        this.cdr.markForCheck();
    }

    public toggleMaximize(win: FloatingWindow, event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }

        const parentRect = this.hostRef.nativeElement.getBoundingClientRect();

        if (!win.isMaximized) {
            win.prevGeometry = {
                x: win.x,
                y: win.y,
                width: win.width,
                height: win.height
            };
            win.x = 8;
            win.y = 8;
            win.width = Math.max(400, parentRect.width - 16);
            win.height = Math.max(300, parentRect.height - 56);
            win.isMaximized = true;
        } else {
            if (win.prevGeometry) {
                win.x = win.prevGeometry.x;
                win.y = win.prevGeometry.y;
                win.width = win.prevGeometry.width;
                win.height = win.prevGeometry.height;
            }
            win.isMaximized = false;
        }

        this.bringToFront(win);
        this.scheduleLayout(win);
        this.cdr.markForCheck();
    }

    public restoreFromDock(win: FloatingWindow): void {
        win.isMinimized = false;
        this.bringToFront(win);
        this.scheduleLayout(win);
        this.cdr.markForCheck();
    }

    public onCodeChange(win: FloatingWindow, newCode: string): void {
        win.content = newCode;
        win.isDirty = win.content !== win.originalContent;
        this.windowCodeChange.emit({ window: win, code: newCode });
        this.cdr.markForCheck();
    }

    public save(win: FloatingWindow, event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }
        win.isSaving = true;
        this.cdr.markForCheck();
        this.windowSave.emit(win);
    }

    // --- Manipulação de Arraste (Movable) ---
    public startDrag(win: FloatingWindow, event: MouseEvent): void {
        if (event.button !== 0 || win.isMaximized) return;

        // Se clicou em botão na barra de título, não inicia arraste
        if ((event.target as HTMLElement).closest('button, input, select')) {
            return;
        }

        this.bringToFront(win);
        this.activeDraggingWin = win;
        this.dragOffset = {
            x: event.clientX - win.x,
            y: event.clientY - win.y
        };

        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        });
    }

    // --- Manipulação de Redimensionamento (Resizable) ---
    public startResize(win: FloatingWindow, event: MouseEvent): void {
        if (event.button !== 0 || win.isMaximized) return;
        event.stopPropagation();

        this.bringToFront(win);
        this.activeResizingWin = win;
        this.resizeStart = {
            x: event.clientX,
            y: event.clientY,
            width: win.width,
            height: win.height
        };

        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        });
    }

    private onMouseMove = (event: MouseEvent) => {
        if (this.activeDraggingWin) {
            const win = this.activeDraggingWin;
            win.x = Math.max(-win.width + 120, event.clientX - this.dragOffset.x);
            win.y = Math.max(0, event.clientY - this.dragOffset.y);
            this.cdr.markForCheck();
            return;
        }

        if (this.activeResizingWin) {
            const win = this.activeResizingWin;
            const deltaX = event.clientX - this.resizeStart.x;
            const deltaY = event.clientY - this.resizeStart.y;

            win.width = Math.max(360, this.resizeStart.width + deltaX);
            win.height = Math.max(240, this.resizeStart.height + deltaY);

            if (win.editorInstance) {
                win.editorInstance.layout();
            }
            this.cdr.markForCheck();
        }
    };

    private onMouseUp = () => {
        if (this.activeResizingWin?.editorInstance) {
            this.activeResizingWin.editorInstance.layout();
        }
        this.activeDraggingWin = null;
        this.activeResizingWin = null;
        this.removeGlobalDragListeners();
    };

    private removeGlobalDragListeners(): void {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    private scheduleLayout(win: FloatingWindow): void {
        setTimeout(() => {
            if (win.editorInstance) {
                win.editorInstance.layout();
            }
        }, 80);
    }

    // --- Eventos do Monaco Editor da Janela Flutuante ---
    public onEditorEvent(win: FloatingWindow, event: NuMonacoEditorEvent): void {
        if (event.type === 'init') {
            win.editorInstance = event.editor;

            const monacoInstance = typeof monaco !== 'undefined' ? monaco : null;
            if (monacoInstance) {
                this.workspaceService.setupTypeScript(monacoInstance);

                // Atalho Ctrl+S / Cmd+S dentro do editor flutuante
                win.editorInstance.addCommand(
                    monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
                    () => {
                        this.ngZone.run(() => {
                            this.save(win);
                        });
                    }
                );
            }

            // Se foi solicitado posicionamento em linha específica (ex: ao clicar no membro da classe)
            if (win.lineNumber && win.lineNumber > 0) {
                setTimeout(() => {
                    if (win.editorInstance) {
                        const line = win.lineNumber!;
                        const col = win.column || 1;
                        win.editorInstance.setPosition({ lineNumber: line, column: col });
                        win.editorInstance.revealLineInCenter(line);
                        win.editorInstance.focus();
                        this.flashEditorLine(win, line);
                    }
                }, 120);
            }
        }
    }

    private flashEditorLine(win: FloatingWindow, line: number): void {
        if (!win.editorInstance) return;
        const monacoInstance = typeof monaco !== 'undefined' ? monaco : null;
        if (!monacoInstance) return;

        const maxCol = win.editorInstance.getModel()?.getLineMaxColumn(line) || 100;
        const range = new monacoInstance.Range(line, 1, line, maxCol);

        const decorations = win.editorInstance.deltaDecorations([], [
            {
                range,
                options: {
                    isWholeLine: true,
                    className: 'monaco-uml-highlight-line'
                }
            }
        ]);

        setTimeout(() => {
            if (win.editorInstance) {
                win.editorInstance.deltaDecorations(decorations, []);
            }
        }, 1600);
    }
}
