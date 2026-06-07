import { Component, Optional } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IAction } from '@ci/components/action';
import { CoreModule } from '@ci/core';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CoreModule,
        RouterModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    actions?: IAction<any>[] = [
        /* {
            label: 'Migrar meu produto'
        },
        {
            label: 'Divulgar Curso'
        },
        {
            label: 'Explorar'
        }, */
        {
            label: 'Cirar ',
            onClick: () => {
                this.router?.navigate(['Treinamento/Create']);
            }
        },
        /*  {
             label: 'Prestação de Serviços'
         }, */
    ];
    constructor(@Optional() private router?: Router) { }
}
