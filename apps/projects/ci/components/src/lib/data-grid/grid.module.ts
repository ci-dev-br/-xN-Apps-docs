import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core"
import { TextCellRenderer } from "./cell-renderer/cell-renderer.component";
import { ContainerModule } from "../container/container.module";
import { DataGridComponent } from "./data-grid.component";
import { MatTableModule } from "@angular/material/table";
import { HeaderCellRenderer } from "./header-cell/header-cell.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { DataGridService } from "./data-grid.service";
import { DataGridOptions, IColumnOption } from "./data-grid.options";

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
    ],
    exports: [
        TextCellRenderer,
        DataGridComponent,
    ],
    providers: [

    ]
})
export class GridModule { }

export {
    DataGridComponent,
    TextCellRenderer,
    HeaderCellRenderer,
    IColumnOption,
    DataGridOptions,
}