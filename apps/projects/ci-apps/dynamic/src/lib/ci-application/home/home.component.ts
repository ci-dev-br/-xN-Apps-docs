import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditarDetailComponent, EditarDetailModule } from '@ci/components/editar-detail';
import { ApplicationService } from '@ci/portal-api';

@Component({
    selector: 'ci-home',
    imports: [
        MatButtonModule,
        MatDialogModule,
        EditarDetailModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    constructor(
        private dialog: MatDialog,
        private applicationService: ApplicationService,
    ) { }
    async novo() {
        const new_application = {};
        // this.applicationService.sync({})
        this.dialog.open(EditarDetailComponent, {
            data: {
                schemaName: 'Application',
                new_application
            }
        });
    }
}
