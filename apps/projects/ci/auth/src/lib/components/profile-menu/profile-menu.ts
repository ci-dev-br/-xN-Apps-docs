import { Component } from "@angular/core";
import { User } from "@ci/portal-api";
import { UserAuthenticationService } from "../../services/user-authentication-user.service";
import { UserPhoto } from "../user-photo/user-photo";
/**
 * Menu de perfil do usuário.
 * 
 * Este componente exibe um menu com opções relacionadas ao perfil do usuário,
 * como configurações, logout, etc.
 */
@Component({
    selector: 'ci-profile-menu',
    templateUrl: './profile-menu.html',
    styleUrls: ['./profile-menu.scss'],
    standalone: true,
    imports: [
        UserPhoto,
    ]
})
export class ProfileMenu {
    protected user?: User;
    constructor(
        private readonly users: UserAuthenticationService,
    ) {
        this.users.user.subscribe((user) => {
            if (user)
                this.user = user;
        });
    }
}