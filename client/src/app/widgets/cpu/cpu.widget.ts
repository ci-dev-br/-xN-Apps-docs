import { Component, NgModule } from "@angular/core";
import { ApiModule, SystemService } from "@portal/api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'px-iframe-widget',
    template: ``,
    styles: [``]
})
export class CPUWidget {
    constructor(
        private readonly service: SystemService,
    ) {
        this.load();
    }
    async load() {
        await lastValueFrom(
            this.service.systemLeitura()
        );
    }
}
@NgModule({
    declarations: [
        CPUWidget,
    ],
    imports: [
        ApiModule,
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