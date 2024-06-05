import { Component } from "@angular/core";
import { WindowService } from "src/app/components/window/window.service";
import { CoreModule } from "src/app/core/core.module";

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