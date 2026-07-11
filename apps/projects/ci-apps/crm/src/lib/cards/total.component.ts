import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--total',
    styles: [
        ':host {text-align: center}'
    ],
    template: `
        @if(title){<h4>{{title}}</h4>}
        @if(ultimoValor){<h1>{{ultimoValor | number: '0.2-2'}}</h1>}
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class TotalComponent {
    @Input() title?: string;
    @Input() ultimoValor?: number = Math.random() * 2048 ** 2;
}
export const TotalCardInfo = {
    title: 'Totalizador',
    descricao: `Visualize a totalização de uma conjunto de dados.`,
    tags: ['Total'],
    componentRef: TotalComponent,
    componentVersion: '1.0.0',
    componentName: 'TotalComponent',
    settings: {

    }
};