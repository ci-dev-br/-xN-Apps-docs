import { Component } from "@angular/core";
import { UserService } from "@ci/auth";
import { IMenuItem } from "./i-menu-item";
import { MatCardModule } from "@angular/material/card";

@Component({
    selector: 'ci-navbar',
    standalone: false,
    templateUrl: 'navbar.component.html',
    styleUrls: [
        `navbar.component.scss`,
    ]
})
export class NavbarComponent {
    user = this.userService.user;
    menuItens?: IMenuItem[];
    constructor(
        private readonly userService: UserService,
    ) { }
    async sair() {
        this.userService?.sair();
    }
}