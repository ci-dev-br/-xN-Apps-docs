import { Component } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { IWidget } from "src/app/widgets/i-widget";
import { Widgets } from "src/app/widgets/widgets";

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
    pesquisaControl: FormControl = this.fb.control('');
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