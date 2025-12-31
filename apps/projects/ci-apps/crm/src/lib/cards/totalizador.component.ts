import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--crm-totalizador',
    template: `
    <p>
        Nenhuma fonte configurada :(
            <a (click)="configurarFonte()" >configurar rapidamente.</a>
    </p>
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class TotalizadorComponent {
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