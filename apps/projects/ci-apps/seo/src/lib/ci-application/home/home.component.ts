import { Component } from '@angular/core';
import { BoardModule } from '@ci/components';

@Component({
    selector: 'ci-home',
    imports: [
        BoardModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
