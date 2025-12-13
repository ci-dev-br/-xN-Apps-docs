import { Component, Input } from "@angular/core";
import { CoreModule } from "@ci/core";
import { CalendarComponent } from "@ci/components/calendar";

@Component({
    selector: 'ci-card--calendar',
    template: `
        <ci-calendar [viewMode]="viewMode">
        </ci-calendar>
    `,
    standalone: true,
    imports: [
        CoreModule,
        CalendarComponent,
    ]
})
export class CardCalendarComponent {
    @Input() viewMode?: 'day' | 'month' | 'year' = 'month';

}
export const CalendarCardInfo = {
    title: 'Calendar',
    descricao: `Top Agents.`,
    tags: ['CRM', 'Receita', 'List'],
    componentRef: CardCalendarComponent,
    componentVersion: '1.0.0',
    componentName: 'CalendarComponent',
    settings: {

    }
};