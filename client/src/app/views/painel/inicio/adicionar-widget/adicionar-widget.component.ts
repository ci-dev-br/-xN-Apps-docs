import { Component } from "@angular/core";
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
    constructor() { }
}