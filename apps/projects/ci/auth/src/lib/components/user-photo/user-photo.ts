import { Component, forwardRef, Inject, Optional } from "@angular/core";
import { CoreModule } from "@ci/core";
import { UserAuthenticationService } from "../../services/user-authentication-user.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'ci-user-photo',
    templateUrl: 'user-photo.html',
    styleUrl: 'user-photo.scss',
    standalone: true,
    imports: [
        CommonModule,
    ]
})
export class UserPhoto {
    protected profileImage?: string;
    constructor(
        @Optional() @Inject(forwardRef(() => UserAuthenticationService)) private readonly authUserService?: UserAuthenticationService,
    ) {
        this.authUserService?.user.subscribe(user => {
            if (user?.photo && user?.photo.format) {
                this.profileImage = user.photo.format! + 'base64,' + user.photo.originalFile;
            }
        })
    }
}