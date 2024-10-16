import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { IWidget } from "src/app/widgets/i-widget";
import { Widgets } from "src/app/widgets/widgets";
import { WidgetService } from "../widget.service";

@Component({
    selector: 'px-adicionar-widget',
    templateUrl: 'adicionar-widget.component.html',
    styleUrls: [
        'adicionar-widget.component.scss'
    ]
})
export class AdicionarWidgetComponent implements OnInit {
    widgets: IWidget[] = [];
    stage: 'find' | 'settings' = 'find';
    selecionado?: IWidget;
    formSettings?: FormGroup;
    pesquisaControl: FormControl = this.fb.control('');
    constructor(
        private readonly widgetServices: WidgetService,
        private readonly fb: FormBuilder,
    ) { }
    ngOnInit() {
        this.pesquisaControl.valueChanges.subscribe((v: string) => this.pesquisar(v))
    }
    configurarWidget(item: IWidget) {
        this.selecionado = item;
        if (item.settings) {
            const group: any = {
            };
            Object.entries(item.settings).forEach(kv => {
                kv[1]
                group[kv[0]] = [];
            })
            this.formSettings = this.fb.group(group);
        }
    }
    adicionarWidget() {
        const settings = this.formSettings?.getRawValue();
        const widget_info = this.selecionado;
        if (widget_info) this.widgetServices.adicionarWidget(settings, widget_info);
        this.selecionado = undefined;
    }
    pesquisar(value: string) {
        this.widgets = Widgets.filter((w: IWidget) => value && value.length > 0 && (
            (w?.description && w?.description.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) > -1) ||
            (w?.title && w?.title.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) > -1))
        );
    }
}