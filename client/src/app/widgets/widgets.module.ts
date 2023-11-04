import { NgModule } from "@angular/core";
import { IFrameWidgetModule } from "./iframe/iframe.widget";

@NgModule({
    imports: [
        IFrameWidgetModule,
    ],
    exports: [
        IFrameWidgetModule,
    ]
})
export class WidgetModule { }