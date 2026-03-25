import { Component } from '@angular/core';
import { IAction } from '@ci/components';
import { CoreModule } from '@ci/core';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CoreModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    actions?: IAction<any>[] = [
        {
            label: 'Migrar meu produto'
        },
        {
            label: 'Divulgar Curso'
        },
        {
            label: 'Explorar'
        },
        {
            label: 'Cirar e Vender'
        },
        {
            label: 'Prestação de Serviços'
        },
    ];
}
