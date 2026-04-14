import { Component, Optional } from "@angular/core";
import { CoreModule } from "@ci/core";
import { UserAuthenticationService } from "../../services/user-authentication-user.service";

@Component({
    selector: 'ci-user-photo',
    templateUrl: 'user-photo.html',
    styleUrl: 'user-photo.scss',
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class UserPhoto {
    protected profileImage?: string;
    constructor(
        @Optional() private readonly authUserService?: UserAuthenticationService,
    ) {
        this.authUserService?.user.subscribe(user => {
            if (user?.photo && user?.photo.format) {
                this.profileImage = user.photo.format! + 'base64,' + user.photo.originalFile;
            }
        })
    }
}