import { Component, Inject, Optional } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { IColumnOption } from "../models/i-column-options";

@Component({
    selector: 'ci-editar-colunas',
    templateUrl: `editar-colunas.component.html`,
    styleUrl: 'editar-colunas.component.scss',
    standalone: false
})
export class EditarColunasComponent {
    columns?: IColumnOption<any>[];
    constructor(
        @Optional() @Inject(MAT_DIALOG_DATA)
        private readonly data?: Object
    ) {
        this.columns = (data as any)?.columns
    }
}