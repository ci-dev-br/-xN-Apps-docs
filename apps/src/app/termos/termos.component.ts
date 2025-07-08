import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'ci-termos',
    standalone: true,
    imports: [
        MatToolbarModule,
    ],
    templateUrl: './termos.component.html',
    styleUrl: './termos.component.scss'
})
export class TermosComponent {

}
