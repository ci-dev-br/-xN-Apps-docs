import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditarDetailComponent, EditarDetailModule } from '@ci/components/editar-detail';

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
    ) { }
    async novo() {
        this.dialog.open(EditarDetailComponent);
    }
}
