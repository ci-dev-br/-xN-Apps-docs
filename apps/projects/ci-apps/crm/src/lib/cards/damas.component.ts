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
    title: 'Damas',
    descricao: `Jogo de Damas`,
    tags: ['Game'],
    componentRef: DamasCard,
    componentVersion: '1.0.0',
    componentName: 'Damas',
    settings: {

    }
};