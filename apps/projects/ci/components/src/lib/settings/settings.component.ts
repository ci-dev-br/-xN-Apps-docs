import { Component } from "@angular/core";
import { WindowService } from "@ci/components";
import { CoreModule } from "@ci/core";
export interface ISettingOption {
    code?: string;
    value?: string;
}
export interface ISettings {
    options: ISettingOption[]
}
@Component({
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