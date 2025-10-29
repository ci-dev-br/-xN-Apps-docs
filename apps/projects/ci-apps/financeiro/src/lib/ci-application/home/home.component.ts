import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IAction, WindowModule, WindowService } from '@ci/components';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        WindowModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    entidades = [

    ]
    @Input()
    actions?: IAction<unknown>[] = [
        {
            description: 'Novo Lançamento',
            onClick: () => {
                // inject(WindowService)
                //     .open(EditComponent, null)
            }
        }
    ]
}
