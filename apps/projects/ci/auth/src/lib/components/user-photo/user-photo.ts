import { Component, forwardRef, Inject, Optional } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { UserAuthenticationService } from "../../services/user-authentication-user.service";

import { formatUserPhotoUrl } from "../../utils/photo.utils";

@Component({
    selector: 'ci-user-photo',
    templateUrl: 'user-photo.html',
    styleUrl: 'user-photo.scss',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
    ]
})
export class UserPhoto {
    protected profileImage?: string;
    protected hasError = false;

    constructor(
        @Optional() @Inject(forwardRef(() => UserAuthenticationService)) private readonly authUserService?: UserAuthenticationService,
    ) {
        this.authUserService?.user.subscribe(user => {
            this.hasError = false;
            this.profileImage = this.extractPhotoUrl(user?.photo);
        });
    }

    protected extractPhotoUrl(photo: any): string | undefined {
        return formatUserPhotoUrl(photo) || undefined;
    }

    onImageError() {
        this.hasError = true;
    }
}