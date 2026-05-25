import { Component, inject, Input, OnInit } from "@angular/core";
import { USER_MENU, UserAuthenticationService } from "@ci/auth";
import { INavbarItemMenu } from "./i-menu-item";
import { IItemMenu } from "@ci/components/window";

@Component({
    selector: 'ci-navbar',
    standalone: false,
    templateUrl: 'navbar.component.html',
    styleUrls: [
        `navbar.component.scss`,
    ]
})
export class NavbarComponent implements OnInit {
    /*  @Input()
     menuApps?: MatMenu; */
    @Input() apps?: any[];
    user = this.userService.user;
    menuItens?: INavbarItemMenu[];
    userMenuList?: IItemMenu[] = inject(USER_MENU, { optional: true }) || undefined;
    constructor(
        private readonly userService: UserAuthenticationService,
    ) { }
    ngOnInit(): void {
        /* this.menuApps; */
    }
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