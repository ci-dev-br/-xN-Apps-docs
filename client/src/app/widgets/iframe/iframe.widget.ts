import { Component, NgModule } from "@angular/core";
import { IWidget } from "../i-widget";

@Component({
    selector: 'px-iframe-widget',
    template: ``,
    styles: [``]
})
export class IFrameWidget {
    constructor() { }
}
@NgModule({
    declarations: [
        IFrameWidget,
    ],
    exports: [
        IFrameWidget,
    ]
})
export class IFrameWidgetModule { }
export const IFrameWidgetInfo: IWidget = {
    title: "IFrame Widget",
    description: 'Página externa a partir de uma URL.',
    tags: ['Elementos'],
    settings: {
        title: { type: 'text', maxLength: 80, label: 'Título' },
        url: { type: 'text', maxLength: 1024, label: 'Endereço URL' },
    },
    module: IFrameWidgetModule, component: IFrameWidget,
}