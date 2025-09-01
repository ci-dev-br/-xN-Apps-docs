import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CoreModule } from "@ci/core";
import { ApiModule, Application, ApplicationService } from "@ci/portal-api";

@Component({
    imports: [
        CoreModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatButtonModule,
        MatInputModule,
    ],
    selector: 'ci-sidebar-settings',
    standalone: true,
    styleUrl: 'sidebar-settings.component.scss',
    templateUrl: 'sidebar-settings.component.html'
})
export class SidebarSettings {
    protected aplicativos?: Application[];
    protected pesquisa: FormGroup;
    protected stage?: 'new-category';
    constructor(
        fb: FormBuilder,
        private readonly aplications: ApplicationService,
    ) {
        this.pesquisa = fb.group({
            search: []
        });
    }
}