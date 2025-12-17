import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: "ci-terminal",
    templateUrl: `terminal.html`,
    styleUrl: 'terminal.scss',
    standalone: true,
    imports: [
        CoreModule,
    ],
})
export class Terminal {

}