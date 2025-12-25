import { Component } from "@angular/core";
/**
 * Menu de perfil do usuário.
 * 
 * Este componente exibe um menu com opções relacionadas ao perfil do usuário,
 * como configurações, logout, etc.
 * 
 */
@Component({
    selector: 'ci-profile-menu',
    templateUrl: './profile-menu.html',
    styleUrls: ['./profile-menu.scss'],
    standalone: true,
})
export class ProfileMenu {
    constructor() {

    }
}