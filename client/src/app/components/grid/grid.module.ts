import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core"
import { TextCellRenderer } from "./cell-renderer/cell-renderer.component";
import { ContainerModule } from "../container/container.module";
import { DataGridComponent } from "./data-grid.component";

@NgModule({
    declarations: [
        DataGridComponent,
        TextCellRenderer,
    ],
    imports: [
        CommonModule,
        ContainerModule,
    ],
    exports: [
        TextCellRenderer,
        DataGridComponent,
    ]
})
export class GridModule { }