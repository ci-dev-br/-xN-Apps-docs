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
    @Input() recentes?: any[]
    constructor(
        private readonly userService: UserAuthenticationService,
        menuService?: MenuService,
    ) {
        menuService?.userMenu.subscribe(menu => {
            this.userMenuList = menu;
        })
    }
    ngOnInit(): void {
        if (!!this.apps)
            this.recentes = localStorage.getItem('NAV(RECENTES)')?.split(',').map(x => this.apps?.find(a => a.name === x))
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
            // this.router./*  */navigate(['/' + app.url], { relativeTo: this.route.root })
        }
        setTimeout(() => document.body.click(), 300);
        if (app.__cta_hndlred === undefined) app.__cta_hndlred = 0;
        app.__cta_hndlred++;
        if (!this.recentes) this.recentes = [];
        const app_recente_corrente_position = this.recentes.indexOf(app);
        if (app_recente_corrente_position > -1) {
            this.recentes.splice(app_recente_corrente_position, 1);
        }
        this.recentes.reverse();
        this.recentes.push(app);
        this.recentes.reverse();
        if (this.recentes.length > 4) this.recentes.length = 4;
        this.recentes = [...this.recentes];
        localStorage.setItem('NAV(RECENTES)', this.recentes.map((e: any) => String(e.name)).join(','))
    }
}