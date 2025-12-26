import { Component } from "@angular/core";
import { AuthModule, UserService } from '@ci/auth';
import { User } from "@ci/portal-api";
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
})
export class ProfileMenu {
    protected user?: User;
    constructor(
        private readonly users: UserService,
    ) {
        this.users.user.subscribe((user) => {
            if (user)
                this.user = user;
        });
    }
}