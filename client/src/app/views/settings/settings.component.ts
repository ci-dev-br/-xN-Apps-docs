import { Component } from "@angular/core";
import { CoreModule } from "src/app/core/core.module";

@Component({
    standalone: true,
    selector: 'ci-settings',
    imports: [
        CoreModule,
    ],
    template: `teste`
})

export class SettingsComponent {
    constructor(
    ) { }
}