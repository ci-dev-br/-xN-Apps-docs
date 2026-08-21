import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { BoardModule } from '@ci/components';

@Component({
    selector: 'ci-home',
    imports: [
        BoardModule,
        MatTabsModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
