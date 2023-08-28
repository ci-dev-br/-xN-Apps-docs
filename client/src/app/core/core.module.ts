import { NgModule } from "@angular/core";
import { PurePipe } from "./pure.pipe";
import { CommonModule } from "@angular/common";
import { AutoFocusDirective } from "./auto-focus.directive";

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        PurePipe,
        AutoFocusDirective,
    ],
    providers: [
    ],
    exports: [
        PurePipe,
        CommonModule,
        AutoFocusDirective,
    ]
})
export class CoreModule { }