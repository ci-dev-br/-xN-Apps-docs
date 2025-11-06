import { Component } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
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
        MatFormFieldModule,
        MatInputModule,
    ],
    template: ` 
    <mat-form-field>
        <input matInput type="text" placeholder="Painéis" />
    </mat-form-field>
    `, styles: `
    :host{
        display: flex;
        flex-direction: column;
    }`
})
export class SettingsComponent {
    // title = 'Configurações';
    constructor(
        private windowService: WindowService,
    ) {
    }
}