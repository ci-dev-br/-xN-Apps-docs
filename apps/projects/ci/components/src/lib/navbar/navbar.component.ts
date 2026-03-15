import { Component, inject } from "@angular/core";
import { USER_MENU, AuthUserService } from "@ci/auth";
import { IMenuItem } from "./i-menu-item";
import { MatCardModule } from "@angular/material/card";
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
    menuItens?: IMenuItem[];
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