import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core"
import { TextCellRenderer } from "./cell-renderer/cell-renderer.component";
import { ContainerModule } from "../container/container.module";
import { DataGridComponent } from "./data-grid.component";
import { MatTableModule } from "@angular/material/table";

@NgModule({
    declarations: [
        DataGridComponent,
        TextCellRenderer,
    ],
    imports: [
        CommonModule,
        ContainerModule,
        MatTableModule,
    ],
    exports: [
        TextCellRenderer,
        DataGridComponent,
    ]
})
export class GridModule { }