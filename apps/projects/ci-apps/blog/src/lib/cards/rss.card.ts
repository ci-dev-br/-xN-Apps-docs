import { Component, Input } from "@angular/core";
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
export class RSSCard {
    @Input
        () url?: string;
}
export const RSSCardInfo = {
    title: 'RSS',
    descricao: `RSS Card, visualização de conteúdo em feed RSS a partir de xml.`,
    tags: ['Blogs'],
    componentRef: RSSCard,
    componentVersion: '1.0.0',
    componentName: 'RSSCard',
    settings: {
        url: { label: 'Url' }
    }
};