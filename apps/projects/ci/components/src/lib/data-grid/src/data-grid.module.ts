import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core"
import { TextCellRenderer } from "./cell-renderer/cell-renderer.component";
import { ContainerModule } from "../../container/container.module";
import { DataGridComponent } from "./data-grid.component";
import { MatTableModule } from "@angular/material/table";
import { HeaderCellRenderer } from "./header-cell/header-cell.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { GridBuilder } from "./data-grid-builder";
import { ContextMenuModule } from "@ci/components/context-menu";
import { MatMenuModule } from "@angular/material/menu";
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
        MatIconModule,
        MatButtonModule,
        DragDropModule,
        ContextMenuModule,
        MatMenuModule,
    ],
    exports: [
        TextCellRenderer,
        DataGridComponent,
    ],
    providers: [
        GridBuilder,
    ]
})
export class DataGridModule { }
