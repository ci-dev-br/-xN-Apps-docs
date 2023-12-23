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