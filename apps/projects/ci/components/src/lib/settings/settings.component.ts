import { Component } from "@angular/core";
import { WindowService } from "@ci/components";
import { CoreModule } from "@ci/core";

@Component({
    standalone: true,
    selector: 'ci-settings',
    imports: [
        CoreModule,
    ],
    template: `
            
    `
})

export class SettingsComponent {
    // title = 'Configurações';
    constructor(
        private windowService: WindowService,
    ) {
    }
}