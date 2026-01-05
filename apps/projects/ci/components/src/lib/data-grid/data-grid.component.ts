import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core";
import { DataGridService } from "./data-grid.service";
import { IDataGridOptions } from "../models/i-data-grid-options";
import { IColumnOption } from "../models/i-column-options";
import { ShortCut } from "@ci/core";
import { IContextMenu } from "@ci/components/context-menu";
export interface SelectEvent<I> {
    value?: I;
    event: MouseEvent | KeyboardEvent | Event;
}

@Component({
    selector: 'ci-data-grid',
    templateUrl: 'data-grid.component.html',
    styleUrls: ['data-grid.component.scss'],
    standalone: false,
    providers: [DataGridService],
})
export class DataGridComponent<I> {
    @Output()
    sorted = new EventEmitter<any>();
    @Output()
    select = new EventEmitter<SelectEvent<I>>();
    @Input()
    selectionMode?: 'cell' | 'row' | 'multi-cell' | 'multi-row' | 'multi' = 'row';
    @Input()
    source?: I[];
    @ViewChild('gridContainer', { static: true })
    gridContainer?: ElementRef<HTMLElement>;
    headerContextMenu?: IContextMenu[] = [
        { label: 'Editar colunas' }
    ];
    private _selectedItem?: I | undefined;
    /**
     * Indica o item selecionado durante a navegação
     */
    public get selectedItem(): I | undefined {
        return this._selectedItem;
    }
    @Input()
    public set selectedItem(value: I | undefined) {
        if (this._selectedItem === value) return;
        this._selectedItem = value;
        if (this._selectedItem && this.source && this._selectedIndex !== undefined && this._selectedItem !== this.source[this._selectedIndex]) {
            this.selectedIndex = this.source.indexOf(this._selectedItem);
        }
    }
    @Input()
    selectedItems?: I[];
    private _selectedIndex?: number | undefined;
    /**
     * Indica o índice na lista do item selecionado.
     */
    public get selectedIndex(): number | undefined {
        return this._selectedIndex;
    }
    @Input()
    public set selectedIndex(value: number | undefined) {
        if (this._selectedIndex === value) return;
        this._selectedIndex = value;

        if (this.source && this.selectedItem && value !== this.source?.indexOf(this.selectedItem)) {
            this.selectedItem = this.source[this.source?.indexOf(this.selectedItem)];
        }
    }
    private _options?: IDataGridOptions<I> | undefined;
    public get options(): IDataGridOptions<I> | undefined {
        return this._options;
    }
    @Input()
    public set options(value: IDataGridOptions<I> | undefined) {
        if (this._options === value) return;
        this._options = value;
        this.columns = this._options?.columns;
        this.displayedColumns = this.columns?.filter(c => !c.hide && c.defaultVisible !== false)?.map((c, i) => c.fieldName || '')
    }
    columns?: IColumnOption<I>[];
    displayedColumns?: string[];
    constructor(
        private readonly services: DataGridService,
    ) {
        services.grid = this;
    }
    rowSelectionHandler(event: MouseEvent, row: I) {
        if (this.selectionMode === 'row') {
            if (event.ctrlKey) {
                if (row === this.selectedItem) {
                    this.select.emit(undefined);
                    this.selectedItem = undefined;
                    return;
                }
            }
            this.select.emit({ value: row, event });
            this.selectedItem = row;
        }
    }
    @HostListener('keydown', ['$event'])
    async keyDownHandler(event: KeyboardEvent) {
        [
            {
                desc: "Navegar para cima",
                keyCode: 'ArrowUp',
                action: () => { if (this.selectedIndex !== undefined) this.selectedIndex-- }
            },
            {
                desc: "Navegar para baixo",
                keyCode: 'ArrowDown',
                action: () => { if (this.selectedIndex !== undefined) this.selectedIndex++ }
            }
        ].find(s => s.keyCode === event.code)?.action();
    }

    /*
     *
        Sugestão de implementação com decorators

    
    @ShortCut({
        default: 'ArrowUp',
    })
    navigateToUp(event: KeyboardEvent) {
            
    }
    @ShortCut({
        default: 'ArrowDown',
    })
    navigateToDown(event: KeyboardEvent) {
        
    }
    */
}