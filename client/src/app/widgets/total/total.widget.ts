import { Component, Input, NgModule } from "@angular/core";

@Component({
    selector: 'px-iframe-widget',
    template: `
    <div [style.font-size]="fontSize">
        {{value}}
    </div>
`,
    styles: [``]
})
export class TotalWidget {
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
        value: { type: 'text', label: "Valor total" },
        fontSize: { type: 'text', label: "Font Size" },
    },
    module: TotalWidgetModule, component: TotalWidget
};