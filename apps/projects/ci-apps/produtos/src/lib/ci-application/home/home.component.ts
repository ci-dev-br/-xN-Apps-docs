import { Component } from '@angular/core';
import { DataDetailViewModule } from '@ci/components';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        DataDetailViewModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
