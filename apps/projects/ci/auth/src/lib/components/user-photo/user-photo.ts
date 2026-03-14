import { Component } from "@angular/core";
import { CoreModule } from "@ci/core";
import { AuthModule, UserService } from '@ci/auth';

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
        private readonly authUserService: UserService,
    ) {
        this.authUserService.user.subscribe(user => {
            if (user?.photo && user?.photo.format) {
                this.profileImage = user.photo.format! + 'base64,' + user.photo.originalFile;
            }
        })
    }
}