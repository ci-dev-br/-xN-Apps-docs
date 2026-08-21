import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--available-for-instant-payout',
    template: `
        <h3>Available for Instant payout</h3>
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class AvailableForInstantPayoutComponent {
}
export const AvailableForInstantPayoutCardInfo = {
    title: 'AvailableForInstantPayout',
    descricao: `Top Agents.`,
    tags: ['CRM', 'Receita', 'List'],
    componentRef: AvailableForInstantPayoutComponent,
    componentVersion: '1.0.0',
    componentName: 'AvailableForInstantPayoutComponent',
    settings: {

    }
};