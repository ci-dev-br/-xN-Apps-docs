import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core"
import { TextCellRenderer } from "./cell-renderer/cell-renderer.component";
import { ContainerModule } from "../container/container.module";
import { DataGridComponent } from "./data-grid.component";
import { MatTableModule } from "@angular/material/table";
import { HeaderCellRenderer } from "./header-cell/header-cell.component";

@NgModule({
    declarations: [
        DataGridComponent,
        TextCellRenderer,
        HeaderCellRenderer,
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