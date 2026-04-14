import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button'
import { RouterModule } from '@angular/router';

@Component({
    selector: 'ci-home',
    imports: [
        CommonModule,
        MatButtonModule,
        RouterModule,
    ],
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    importFromFile() {
        // TODO: implementar método
    }
}
