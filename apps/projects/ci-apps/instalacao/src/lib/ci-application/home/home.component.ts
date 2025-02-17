import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'ci-home',
    imports: [
        MatCardModule,
        MatButtonModule,
    ],
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
