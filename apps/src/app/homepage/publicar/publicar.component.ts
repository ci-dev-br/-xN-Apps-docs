import { Component, Inject, Optional } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { AuthModule, UserPhoto, UserAuthenticationService } from "@ci/auth";
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
    authorName?: string;
    constructor(
        @Optional() private readonly dialogReference?: MatDialogRef<Publicar>,
        @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: Object,
        @Optional() private readonly authUserService?: UserAuthenticationService,
    ) {
        this.authUserService?.user.subscribe(user => {
            if (user?.photo && user?.photo.format) {
                this.authorName = user.surname || user.fullName || user.username || undefined;
            } else {
                this.authorName = undefined;
            }
        })
    }
    async publicar() {
        this.dialogReference?.close();
    }
}