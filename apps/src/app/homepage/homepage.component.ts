import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar.component';

@Component({
    selector: 'ci-homepage',
    imports: [
        CommonModule,
        RouterModule,
        NavbarComponent,
    ],
    templateUrl: './homepage.component.html',
    standalone: true,
    styleUrl: './homepage.component.scss'
})
export class HomepageComponent {

}
