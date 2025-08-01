import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--crm-totalizador',
    template: `
        <h3>Statistics</h3>
        CHART
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class StatisticsComponent {

}
export const StatisticsCardInfo = {
    title: 'Statistics',
    descricao: `Top Agents.`,
    tags: ['CRM', 'Receita', 'List'],
    componentRef: StatisticsComponent,
    componentVersion: '1.0.0',
    componentName: 'StatisticsComponent',
    settings: {

    }
};