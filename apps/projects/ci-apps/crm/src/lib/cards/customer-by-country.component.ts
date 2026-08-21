import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--customer-by-contry',
    template: `
        <h3>Consumiudores por Países</h3>
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class CustomerByContryComponent {
}
export const CustomerByContryCardInfo = {
    title: 'Customer by contry',
    descricao: `Top Agents.`,
    tags: ['CRM', 'Receita', 'List'],
    componentRef: CustomerByContryComponent,
    componentVersion: '1.0.0',
    componentName: 'CustomerByContryComponent',
    settings: {

    }
};