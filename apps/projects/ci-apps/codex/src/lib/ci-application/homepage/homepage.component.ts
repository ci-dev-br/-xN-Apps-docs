import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { CoreModule } from "@ci/core";


@Component({
    standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
    ],
    selector: 'ci-homepage',
    templateUrl: 'homepage.component.html',
    styleUrl: 'homepage.component.scss'
})
export class HomepageComponent {
    constructor() { }
}