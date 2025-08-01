import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--crm-totalizador',
    template: `
        <h4>Total de Vendas</h4>
        <p>
            R$ 145,20
        </p>
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class TotalizadorComponent {

}
export const TotalizadorCardInfo = {
    title: 'Total de Vendas',
    descricao: `Verifique o total de vendas realizados durante o período selecionado.`,
    tags: ['CRM', 'Totalizador', 'Relatório'],
    componentRef: TotalizadorComponent,
    componentVersion: '1.0.0',
    componentName: 'TotalizadorComponent',
    settings: {

    }
};