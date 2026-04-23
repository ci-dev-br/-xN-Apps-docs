import { Component, Inject } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { WindowService } from "@ci/components/window";
import { CoreModule, DaoService } from "@ci/core";
import { Prancheta } from "@ci/portal-api";
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
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatTooltipModule,
    ],
    templateUrl: 'settings.component.html',
    styleUrl: 'settings.component.scss'
})
export class SettingsComponent {
    editLayoutForm;
    pranchetaEditing?: Prancheta;
    constructor(
        private readonly windowService: WindowService,
        @Inject(MAT_DIALOG_DATA) private readonly dataSettings: Object,
        formBuilder: FormBuilder,
        private readonly daos: DaoService,
    ) {
        this.editLayoutForm = formBuilder.group({
            layoutOrientation: [,],
        })
        if (dataSettings && 'pranchetas' in dataSettings) this.pranchetas = dataSettings.pranchetas as Prancheta[];
    }
    pranchetas?: Prancheta[];
    removerPrancheta(prancheta: Prancheta) {
        //    this.pranchetas;
    }
    editarLayout(prancheta: Prancheta) {
        if (!prancheta.layout) prancheta.layout = {};
        this.pranchetaEditing = prancheta;
        this.editLayoutForm.reset(prancheta.layout);
    }
    confirmarEdicaoLayout() {
        if (!!this.pranchetaEditing) {
            try {
                Object.assign(this.pranchetaEditing.layout, this.editLayoutForm.getRawValue())
            } catch (error) {
                console.trace(error);
            }
        }
        this.daos.confirmChanges(this.pranchetaEditing)
        this.pranchetaEditing = undefined;
    }
}