import { Component, Input } from "@angular/core";
import { DataGridOptions } from "./data-grid.options";


@Component({
    selector: 'ci-data-grid',
    templateUrl: 'data-grid.component.html',
})
export class DataGridComponent<I> {
    @Input()
    source?: I[];
    @Input()
    options?: DataGridOptions;
    constructor() { }
}