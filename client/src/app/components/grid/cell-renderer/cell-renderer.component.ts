import { Component, Input, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { IColumnOption } from "../data-grid.options";

/*export interface IColumns {
    headerName: string;
    propertyName: string;
    rendererType?: string;
    component?: any;
    componentType?: Type<any>
    hide?: boolean;
}*/
@Component({
    selector: 'px-cell-renderer',
    template: `
    <ng-container *ngIf="column && !column?.component">
       {{value}}
    </ng-container>
    <ng-container *ngIf="column && !!column?.component">
        <ng-template #teste>
            {{value}}
        </ng-template>
        <ng-container *ngComponentOutlet="column.component; content: componentContent">
        </ng-container>
    </ng-container>
    `,
    styleUrls: [
        'cell-renderer.component.scss'
    ]
})
export class TextCellRenderer {
    constructor(
        private readonly vcr: ViewContainerRef,
    ) { }
    // private _teste!: TemplateRef<any>;
    // public get teste(): TemplateRef<any> {
    //     return this._teste;
    // }
    // @ViewChild('teste', { static: false })
    // public set teste(value: TemplateRef<any>) {
    //     // this._teste = value;
    //     // this.componentContent = [
    //     //     this.vcr?.createEmbeddedView(this.teste)?.rootNodes,
    //     // ];
    // }
    @Input()
    data?: any;
    @Input()
    column?: IColumnOption;
    componentContent?: any[][];
    ngOnInit() {

    }

    get value() {
        if (this.column?.fieldName && this.data)
            return this.data[this.column?.fieldName]
    }
}