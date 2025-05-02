import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--crm-totalizador',
    template: `
        <h4>Receita Anual</h4>
        
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class ReceitaAnualComponent {

}
export const ReceitaAnualCardInfo = {
    title: 'Receita Anual',
    descricao: `Verifique o total de vendas realizados durante o período selecionado.`,
    tags: ['CRM', 'Receita', 'Gráfico'],
    componentRef: ReceitaAnualComponent,
    componentVersion: '1.0.0',
    componentName: 'ReceitaAnualComponent',
    settings: {

    }
};