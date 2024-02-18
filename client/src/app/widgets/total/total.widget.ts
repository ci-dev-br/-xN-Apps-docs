import { Component, NgModule } from "@angular/core";

@Component({
    selector: 'px-iframe-widget',
    template: `
    {{value}}
    `,
    styles: [``]
})
export class TotalWidget {
    value?: number;
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
        value: { type: 'text', label: "Valor total" }
    },
    module: TotalWidgetModule, component: TotalWidget
};