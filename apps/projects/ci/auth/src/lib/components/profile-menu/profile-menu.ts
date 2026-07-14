import { Component, forwardRef, Inject, Optional } from "@angular/core";
import { UserPhoto } from "../user-photo/user-photo";
import { CommonModule } from "@angular/common";
import { UserAuthenticationService } from "@ci/auth";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
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
        MatButtonModule,
        CommonModule,
        RouterModule,
        MatIconModule,
        MatExpansionModule,
    ]
})
export class ProfileMenu {
    protected user = this.users.user;
    constructor(
        @Optional() @Inject(forwardRef(() => UserAuthenticationService)) private readonly users: UserAuthenticationService,
    ) { }
}