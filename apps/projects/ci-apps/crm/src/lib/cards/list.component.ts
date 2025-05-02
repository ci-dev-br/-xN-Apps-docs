import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-card--crm-totalizador',
    template: `
        <h4>Top agents</h4>
        <div class="list">
            <div class="item">asds</div>
            <div class="item">erqge</div>
            <div class="item">h45h</div>
        </div>
    `,
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class ListComponent {

}
export const ListCardInfo = {
    title: 'Top agents',
    descricao: `Top Agents.`,
    tags: ['CRM', 'Receita', 'List'],
    componentRef: ListComponent,
    componentVersion: '1.0.0',
    componentName: 'ListComponent',
    settings: {

    }
};