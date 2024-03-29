import { Injectable } from "@angular/core";
import { Card, Prancheta } from "@portal/api";
import { BehaviorSubject } from "rxjs";
import { IWidget } from "src/app/widgets/i-widget";
import { Widgets } from "src/app/widgets/widgets";

export interface IWidgetLoadedData {
    widget_info?: IWidget;
    settings?: any;
}

@Injectable()
export class PranchetaService {
    constructor() {
        this.currentPrancheta$.subscribe(v => {
            if (v) this.currentWidgets = this.loadWidgets(v);
        });
    }
    private _$currentWidgets = new BehaviorSubject<IWidgetLoadedData[] | undefined>(undefined);
    get currentWidgets() { return this._$currentWidgets.value }
    set currentWidgets(widgets: IWidgetLoadedData[] | undefined) {
        this._$currentWidgets.next(widgets);
    }
    private _loaded_widgets = new Map<Prancheta, IWidgetLoadedData[]>();
    private $currentPrancheta = new BehaviorSubject<Prancheta | undefined>(undefined);
    get currentPrancheta$() {
        return this.$currentPrancheta;
    }
    get currentPrancheta() {
        return this.$currentPrancheta.value;
    }
    set currentPrancheta(value: Prancheta | undefined) {
        this.$currentPrancheta.next(value);
    }
    get $currentWidgets() {
        return this._$currentWidgets;
    }
    loadWidgets(prancheta: Prancheta) {
        if (this._loaded_widgets.has(prancheta)) return this._loaded_widgets.get(prancheta);
        const loaded_widgets: IWidgetLoadedData[] = [];
        prancheta.cards?.forEach(card => {
            loaded_widgets.push({
                settings: card.settings,
                widget_info: Widgets.find(w => w.title === card.componentName),
            } as IWidgetLoadedData);
        })
        this._loaded_widgets.set(prancheta, loaded_widgets);
        return loaded_widgets;
    }
    addWidgetOnPrancheta(settings: any, widget_info: IWidget,) {
        this.currentWidgets?.push({ settings, widget_info });
        if (this.currentPrancheta)
            this.currentPrancheta.cards = this.currentWidgets?.map(w => {
                return {
                    componentName: w.widget_info?.title,
                    settings: w.settings
                } as Card
            }) as Card[] || undefined;
    }
}