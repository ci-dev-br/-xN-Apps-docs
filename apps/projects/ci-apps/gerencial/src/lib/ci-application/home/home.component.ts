import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        RouterModule,
        BoardModule,
        MatTabsModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
