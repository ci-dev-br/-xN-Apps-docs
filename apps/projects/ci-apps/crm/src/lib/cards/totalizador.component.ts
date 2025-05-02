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