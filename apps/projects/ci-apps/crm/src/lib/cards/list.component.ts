import { Component, Input, Type } from "@angular/core";
import { CoreModule, ServicesService } from "@ci/core";

@Component({
    selector: 'ci-card--list',
    template: `
        @if(source){<h4 ci-title>Lista de itens</h4>
        <div class="list">
            @for(item of source;track item){<div class="item-renderer">
                {{item | dao}}
            </div>}
        </div>}@else{Carregando...}
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class ListComponent {
    @Input() source?: any[];
    constructor() { }
}
export const ListCardInfo = {
    title: 'Lista de dados',
    descricao: `Visualização de conjunto de dados em forma de lista.`,
    tags: ['Valores', 'List', 'Listar'],
    componentRef: ListComponent,
    componentVersion: '1.0.0-beta',
    componentName: 'ListComponent',
    settings: {
        service: ServicesService,
        type: Date.name
    }
};