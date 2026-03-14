import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { AuthModule, UserPhoto } from "@ci/auth";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-publicar',
    templateUrl: 'publicar.component.html',
    styleUrl: 'publicar.component.scss',
    standalone: true,
    imports: [
        CoreModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        UserPhoto,
        AuthModule,
    ]
})
export class Publicar {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private readonly data: Object
    ) {

    }

}