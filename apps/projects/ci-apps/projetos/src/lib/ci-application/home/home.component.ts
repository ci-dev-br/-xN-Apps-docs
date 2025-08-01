import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ContainerModule, InputModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { models } from '../../models';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CoreModule,
        ContainerModule,
        MatButtonModule,
        MatToolbarModule,
        RouterModule,
        InputModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    models = models
}
