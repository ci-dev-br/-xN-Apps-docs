import { Injectable } from "@angular/core";
import { IWidget } from "src/app/widgets/i-widget";

@Injectable()
export class WidgetService {
    widgets: { widget: IWidget, settings: any }[] = [];
    constructor(
    ) { }
    async adicionarWidget(
        settings: any,
        widget: IWidget,
    ) {
        this.widgets.push({ settings, widget });
    }
}