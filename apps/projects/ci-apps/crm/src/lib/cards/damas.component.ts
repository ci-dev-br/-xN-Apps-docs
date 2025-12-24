import { Component } from "@angular/core";
import { DamasComponent } from "@ci/apps/imersao/damas";

@Component({
    selector: 'ci-card--damas',
    template: `
        <ci-damas></ci-damas>
    `,
    standalone: true,
    imports: [
        DamasComponent
    ]
})
export class DamasCard {
}
export const DamasPayoutCardInfo = {
    title: 'DamasPayout',
    descricao: `Jogo de Damas`,
    tags: ['CRM', 'Receita', 'List'],
    componentRef: DamasCard,
    componentVersion: '1.0.0',
    componentName: 'DamasPayoutComponent',
    settings: {

    }
};