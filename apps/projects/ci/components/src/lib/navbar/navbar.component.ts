import { Component, inject } from "@angular/core";
import { USER_MENU, AuthUserService } from "@ci/auth";
import { INavbarItemMenu } from "./i-menu-item";
import { IItemMenu } from "@ci/components";

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
    menuItens?: INavbarItemMenu[];
    userMenuList?: IItemMenu[] = inject(USER_MENU, { optional: true }) || undefined;
    constructor(
        private readonly userService: AuthUserService,
    ) { }
    async sair() {
        this.userService?.sair();
    }
    protected async itemMenuActionHandler(itemMenu: IItemMenu, event: Event) {
        if (itemMenu.onClick) itemMenu.onClick(this, event);
    }
}