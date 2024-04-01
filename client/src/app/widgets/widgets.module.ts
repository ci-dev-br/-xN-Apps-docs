import { NgModule } from "@angular/core";
import { IFrameWidgetModule } from "./iframe/iframe.widget";
import { TotalWidgetModule } from "./total/total.widget";
import { CPUWidgetModule } from "./cpu/cpu.widget";

@NgModule({
    imports: [
        IFrameWidgetModule,
        TotalWidgetModule,
        CPUWidgetModule,
    ],
    exports: [
        IFrameWidgetModule,
        TotalWidgetModule,
        CPUWidgetModule,
    ]
})
export class WidgetModule { }