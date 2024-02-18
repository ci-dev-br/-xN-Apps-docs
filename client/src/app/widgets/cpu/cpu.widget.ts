import { Component, NgModule } from "@angular/core";

@Component({
    selector: 'px-iframe-widget',
    template: ``,
    styles: [``]
})
export class CPUWidget {

}
@NgModule({
    declarations: [
        CPUWidget,
    ],
    exports: [
        CPUWidget,
    ]
})
export class CPUWidgetModule { }
export const CPUWidgetInfo = {
    title: "CPU",
    description: 'Visualizar CPU do Servidor',
    tags: [],
    settings: {
        /*  value: { type: 'text', label: "Valor total" } */
    },
    module: CPUWidgetModule, component: CPUWidget
};