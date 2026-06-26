import { Component, Inject, Optional } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
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
        MatSelectModule,
        MatMenuModule,
        ReactiveFormsModule,

    ]
})
export class Publicar {
    authorName?: string;
    postForm = this.fb.group({
        title: [, []],
        content: [, []],
    });
    constructor(
        private readonly fb: FormBuilder,
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
        if (this.postForm.invalid) {
            this.postForm.markAllAsTouched();
        }
        this.dialogReference?.close();
    }
}