import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core"
import { TextCellRenderer } from "./cell-renderer/cell-renderer.component";

@NgModule({
    declarations: [
        TextCellRenderer,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        TextCellRenderer,
    ]
})
export class GridModule { }