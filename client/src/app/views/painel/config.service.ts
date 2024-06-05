import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Card, Prancheta } from "@portal/api";
import { BehaviorSubject } from "rxjs";
import { IWidget } from "src/app/widgets/i-widget";
import { Widgets } from "src/app/widgets/widgets";

export interface IWidgetLoadedData {
    widget_info?: IWidget;
    settings?: any;
    _onConfig?: boolean;
    _form?: FormGroup;
    __grid_template?: string;
}

@Injectable()
export class PranchetaService {
    constructor(
        private readonly fb: FormBuilder,
    ) {
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
            const a = {
                settings: card.settings,
                widget_info: Widgets.find(w => w.title === card.componentName),
            } as IWidgetLoadedData;

            a._form = this.getForm(a);
            a._form?.reset(a.settings);

            if (a._form) {
                a._form.valueChanges.subscribe(values => {
                    a.settings = values;
                })
            }

            loaded_widgets.push(a);
        })
        this._loaded_widgets.set(prancheta, loaded_widgets);
        return loaded_widgets;
    }
    addWidgetOnPrancheta(settings: any, widget_info: IWidget,) {
        this.currentWidgets?.push({ settings, widget_info });
        this.updateCards();
    }
    updateCards() {
        if (this.currentPrancheta)
            this.currentPrancheta.cards = this.currentWidgets?.map(w => {
                return {
                    componentName: w.widget_info?.title,
                    settings: w.settings
                } as Card
            }) as Card[] || undefined;
    }

    getForm(widget: IWidgetLoadedData) {
        if (widget.widget_info?.settings) {
            const group: any = {
            };
            Object.entries(widget.widget_info?.settings).forEach(kv => {
                kv[1]
                group[kv[0]] = [];
            })
            return this.fb.group(group);
        }
        return undefined;
    }
}