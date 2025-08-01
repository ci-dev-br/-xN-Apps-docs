import { Component } from "@angular/core";
import { UserService } from "@ci/auth";

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
    constructor(
        private readonly userService: UserService,
    ) { }
    async sair() {
        this.userService?.sair();
    }
}