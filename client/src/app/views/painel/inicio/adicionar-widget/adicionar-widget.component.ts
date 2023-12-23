import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { IWidget, Widgets } from "src/app/widgets/widgets";

@Component({
    selector: 'px-adicionar-widget',
    templateUrl: 'adicionar-widget.component.html',
    styleUrls: [
        'adicionar-widget.component.scss'
    ]
})
export class AdicionarWidgetComponent {
    widgets = Widgets;
    stage: 'find' | 'settings' = 'find';
    selecionado?: IWidget;
    formSettings?: FormGroup;
    constructor(
        private readonly fb: FormBuilder,
    ) { }
    adicionar(item: IWidget) {
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
}