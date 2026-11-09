import { Injectable, signal } from "@angular/core";
import { INavbarItemMenu } from "./i-menu-item";
import { CoreModule } from "@ci/core";

/**
 * Integra comportamento da barra de navegação padrão.
 */
@Injectable({
    providedIn: 'root',
})
export class NavbarService {
    constructor() { }
    // TODO: viincular controles em Navbar.
    async addOption(item_menu?: INavbarItemMenu) {

        // navbarEndMenu

    }
    navbarStartMenu = signal([]);
    navbarEndMenu = signal([]);
}