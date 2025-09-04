import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";


@Component({
    standalone: true,
    imports: [
        CoreModule,
    ],
    selector: 'ci-homepage',
    template: ``
})
export class HomepageComponent {
    constructor() { }
}