import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--crm-totalizador',
    template: `
        <h3>Calendar</h3>
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class CalendarComponent {
}
export const CalendarCardInfo = {
    title: 'Calendar',
    descricao: `Top Agents.`,
    tags: ['CRM', 'Receita', 'List'],
    componentRef: CalendarComponent,
    componentVersion: '1.0.0',
    componentName: 'CalendarComponent',
    settings: {

    }
};