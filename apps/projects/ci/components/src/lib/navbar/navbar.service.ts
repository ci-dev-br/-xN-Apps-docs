import { Injectable, signal } from "@angular/core";
import { INavbarItemMenu } from "./i-menu-item";

export interface NavbarContextSelectOption {
    label: string;
    value: any;
}

export interface NavbarContextAction {
    id: string;
    label: string;
    icon?: string;
    tooltip?: string;
    variant?: 'basic' | 'stroked' | 'flat' | 'raised' | 'select';
    color?: 'primary' | 'accent' | 'warn';
    disabled?: boolean | (() => boolean);
    active?: boolean | (() => boolean);
    onClick?: (event: Event) => void;
    value?: any | (() => any);
    options?: NavbarContextSelectOption[] | (() => NavbarContextSelectOption[]);
    onChange?: (value: any) => void;
}

/**
 * Integra comportamento da barra de navegação padrão e ações contextuais da tela ativa.
 */
@Injectable({
    providedIn: 'root',
})
export class NavbarService {
    constructor() { }

    navbarStartMenu = signal<INavbarItemMenu[]>([]);
    navbarEndMenu = signal<INavbarItemMenu[]>([]);

    /** Ações do contexto da tela ativa exibidas na barra de navegação */
    contextActions = signal<NavbarContextAction[]>([]);

    /** Título/rótulo opcional do contexto ativo na navbar */
    contextTitle = signal<string | undefined>(undefined);

    async addOption(item_menu?: INavbarItemMenu) {
        if (!item_menu) return;
        this.navbarEndMenu.update(items => [...items, item_menu]);
    }

    setContextActions(actions: NavbarContextAction[], title?: string): void {
        this.contextActions.set(actions || []);
        this.contextTitle.set(title);
    }

    clearContextActions(): void {
        this.contextActions.set([]);
        this.contextTitle.set(undefined);
    }
}
