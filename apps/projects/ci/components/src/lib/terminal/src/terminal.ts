import { isPlatformBrowser } from "@angular/common";
import { Component, ElementRef, EventEmitter, Inject, Input, Output, PLATFORM_ID, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { CoreModule } from "@ci/core";
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
@Component({
    selector: "ci-terminal",
    templateUrl: `terminal.html`,
    styleUrl: 'terminal.scss',
    standalone: true,
    imports: [
        CoreModule,
    ],
    encapsulation: ViewEncapsulation.None
})
export class TerminalComponent {
    @ViewChild('terminalContainer') private terminalContainer!: ElementRef;
    @Input() options: ITerminalOptions = {
        cursorBlink: true,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        theme: {
            background: '#1e1e1e',
            foreground: '#f0f0f0',
            cursor: '#ffffff'
        }
    };
    @Input() dataStream: string | null = null;
    @Output() userInput = new EventEmitter<string>();
    @Output() resize = new EventEmitter<{ cols: number, rows: number }>();
    @Output() ready = new EventEmitter<void>();
    private terminal!: Terminal;
    private fitAddon!: FitAddon;
    private resizeObserver!: ResizeObserver;
    private isBrowser: boolean;
    private pendingWrites: string[] = [];
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }
    async ngAfterViewInit() {
        if (this.isBrowser) {
            await this.initTerminal();
        }
    }
    ngOnChanges(changes: SimpleChanges) {
        if (!this.isBrowser) return;
        if (changes['options'] && this.terminal) {
            Object.keys(this.options).forEach(key => {
                (this.terminal.options as any)[key] = this.options[key as keyof ITerminalOptions];
            });
        }
        if (changes['dataStream'] && changes['dataStream'].currentValue) {
            this.write(changes['dataStream'].currentValue);
        }
    }
    private async initTerminal() {
        try {
            const xtermModule = await import('xterm');
            const fitAddonModule = await import('xterm-addon-fit');
            const TerminalClass = xtermModule.Terminal;
            const FitAddonClass = fitAddonModule.FitAddon;
            this.terminal = new TerminalClass(this.options);
            this.fitAddon = new FitAddonClass();
            this.terminal.loadAddon(this.fitAddon);
            this.terminal.open(this.terminalContainer.nativeElement);
            if (this.pendingWrites.length > 0) {
                for (const chunk of this.pendingWrites) {
                    this.terminal.write(chunk);
                }
                this.pendingWrites = [];
            }
            setTimeout(() => {
                try {
                    this.fitAddon.fit();
                    this.emitResize();
                } catch { }
            }, 100);
            this.terminal.onData((data) => {
                this.userInput.emit(data);
            });
            this.resizeObserver = new ResizeObserver(() => {
                try {
                    this.fitAddon.fit();
                    this.emitResize();
                } catch { }
            });
            this.resizeObserver.observe(this.terminalContainer.nativeElement);
            this.ready.emit();
        } catch (error) {

        }
    }
    public write(data: string) {
        if (this.terminal) {
            this.terminal.write(data);
        } else if (data) {
            this.pendingWrites.push(data);
        }
    }
    public writeln(data: string) {
        this.write(`${data}\r\n`);
    }
    public focus() {
        if (this.terminal) {
            this.terminal.focus();
        }
    }
    public clear() {
        if (this.terminal) {
            this.terminal.clear();
        } else {
            this.pendingWrites = [];
        }
    }
    private emitResize() {
        if (this.terminal) {
            this.resize.emit({
                cols: this.terminal.cols,
                rows: this.terminal.rows
            });
        }
    }
    ngOnDestroy() {
        if (!this.isBrowser) return;
        if (this.terminal) {
            this.terminal.dispose();
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
