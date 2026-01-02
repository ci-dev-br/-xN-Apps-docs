import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";
/**
 * Cartão com valor total de alguma coisa
 */
@Component({
    selector: 'ci-card-total',
    template: `
    <p>
        Nenhuma fonte configurada 😊 </p>
        <p>
        </p>
        <a href="#" (click)="configurarFonte()" >configurar rapidamente.</a>
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class TotalizadorComponent {
    // constructor(protected readonly settings: Config) { }
    async configurarFonte() {

    }
}
export const TotalizadorCardInfo = {
    title: 'Totalizador',
    descricao: `Visualize o valor total de registros, adicione filtros e opções de importação.`,
    tags: ['Totalizadores', 'Cálculo', 'Matemática'],
    componentRef: TotalizadorComponent,
    componentVersion: '1.0.0',
    componentName: 'TotalizadorComponent',
    settings: {
        fonte: {
            typeOf: 'string',
            maxLength: 2000,
        }
    }
};