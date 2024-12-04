import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'ci-branding',
    imports: [
        MatButtonModule,
    ],
    standalone: true,
    templateUrl: './branding.component.html',
    styleUrl: './branding.component.scss'
})
export class BrandingComponent {

}
