import { Component, Input, NgModule, SecurityContext, Type } from "@angular/core";
import { IWidget } from "../i-widget";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'px-iframe-widget',
    template: `
        <div *ngIf="title" class="card-title">{{title}}</div>
        <ng-container class="card-content-full" *ngContainerOutlet="component" >
        </ng-container>
    `,
    styles: [``]
})
export class ComponentWidget {
    @Input()
    title?: string;
    @Input()
    componentCode?: string;
    @Input()
    component?: string;
    constructor(
        private readonly domSanitize: DomSanitizer,
    ) { }
}
@NgModule({
    declarations: [
        ComponentWidget,
    ],
    exports: [
        ComponentWidget,
    ]
})
export class ComponentWidgetModule { }
export const ComponentWidgetInfo: IWidget = {
    title: "Component Widget",
    description: 'Componente dinâmico da Aplicação',
    tags: ['Component Angular', 'Vanilla'],
    settings: {
        title: { type: 'text', maxLength: 80, label: 'Título' },
        componentCode: { type: 'text', maxLength: 1024, label: 'Component CodeName' },
    },
    module: ComponentWidgetModule,
    component: ComponentWidget,
};