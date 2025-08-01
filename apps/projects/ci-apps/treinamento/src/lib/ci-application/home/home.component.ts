import { Component } from '@angular/core';
import { CoreModule } from '@ci/core';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CoreModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

}
