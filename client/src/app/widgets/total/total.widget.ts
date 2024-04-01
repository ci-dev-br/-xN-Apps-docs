import { Component, Input, NgModule } from "@angular/core";

@Component({
    selector: 'px-iframe-widget',
    template: `
    @if(title){<h6 style="padding: 0;margin: 0;">{{title}}</h6>}
    <div [style.font-size]="fontSize" style="text-align: center;">
        {{value}}
    </div>
`,
    styles: [`:host{display:flex; flex-direction: column;}`]
})
export class TotalWidget {
    @Input()
    title?: number;
    @Input()
    value?: number;
    @Input()
    fontSize?: number;
}
@NgModule({
    declarations: [
        TotalWidget,
    ],
    exports: [
        TotalWidget,
    ]
})
export class TotalWidgetModule { }
export const TotalWidgetInfo = {
    title: "Total",
    description: 'Visualizar valor Total.',
    tags: ['Valores'],
    settings: {
        title: { type: 'text', label: "Título" },
        value: { type: 'text', label: "Valor total" },
        fontSize: { type: 'text', label: "Font Size" },
    },
    module: TotalWidgetModule, component: TotalWidget
};