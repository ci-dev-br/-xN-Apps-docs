import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { DataGridService } from "./data-grid.service";
import { IDataGridOptions } from "../models/i-data-grid-options";
import { IColumnOption } from "../models/i-column-options";
import { ShortCut } from "@ci/core";

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
    select = new EventEmitter<I | I[]>();
    @Input()
    selectionMode?: 'cell' | 'row' | 'multi-cell' | 'multi-row' | 'multi' = 'row';
    @Input()
    source?: I[];
    @Input()
    selectedItem?: I;
    @Input()
    selectedItems?: I[];
    @Input()
    selectedIndex?: number;
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
            this.select.emit(row);
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