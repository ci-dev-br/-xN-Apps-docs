import { Component, Input, OnInit } from "@angular/core";
import { UserAuthenticationService } from "@ci/auth";
import { INavbarItemMenu } from "./i-menu-item";
import { IItemMenu } from "@ci/components/window";
import { MenuService } from "@ci/core";

@Component({
    selector: 'ci-navbar',
    standalone: false,
    templateUrl: 'navbar.component.html',
    styleUrls: [
        `navbar.component.scss`,
    ]
})
export class NavbarComponent implements OnInit {
    @Input() apps?: any[];
    user = this.userService.user;
    @Input() menuItens?: INavbarItemMenu[];
    @Input() userMenuList?: IItemMenu[];
    constructor(
        private readonly userService: UserAuthenticationService,
        menuService?: MenuService,
    ) {
        menuService?.userMenu.subscribe(menu => {
            this.userMenuList = menu;
        })
    }
    ngOnInit(): void { }
    async sair() {
        this.userService?.sair();
    }
    protected async itemMenuActionHandler(itemMenu: IItemMenu, event: Event) {
        if (itemMenu.onClick) itemMenu.onClick(this, event);
    }
    async appClickHandler(event: MouseEvent, app: any) {
        if (event.ctrlKey) {
            // window.open(location.href + '/' + app.url, '')
        } else {
            // this.router.navigate(['/' + app.url], { relativeTo: this.route.root })
        }
        setTimeout(() => document.body.click(), 300);
        if (app.__cta_hndlred === undefined) app.__cta_hndlred = 0;
        app.__cta_hndlred++;
        //  this.appsFavoritos = this.apps;
    }
}