import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EditarDetailComponent, IAction, WindowModule, WindowService } from '@ci/components';
import { EditarDetailModule } from '@ci/components/editar-detail';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        WindowModule,
        EditarDetailModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    constructor(
        private readonly windows: WindowService,
    ) { }
    entidades = [

    ]
    @Input()
    actions?: IAction<unknown>[] = [
        {
            description: 'Novo Lançamento',
            onClick: () => {
                this.windows
                    .open(EditarDetailComponent, {});
            }
        }
    ]
}
