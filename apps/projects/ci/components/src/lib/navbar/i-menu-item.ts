import { Type } from "@angular/core";

export type NavbarMenuSlot = 'start' | 'end' | 'user-menu';

export interface INavbarItemMenu {
    id?: string;
    label?: string;
    title?: string;
    tooltip?: string;
    icon?: string;
    type?: 'material' | 'svg';
    routerLink?: string | any[];
    queryParams?: Record<string, any>;
    href?: string;
    target?: string;
    component?: Type<any>;
    /** Componente renderizado dentro de um mat-menu acionado pelo botão da barra */
    menuComponent?: Type<any>;
    /** Componente de diálogo aberto via MatDialog ao clicar */
    dialogComponent?: Type<any>;
    dialogData?: any;
    dialogConfig?: Record<string, any>;
    inputs?: Record<string, any>;
    slot?: NavbarMenuSlot;
    group?: NavbarMenuSlot | string;
    order?: number;
    roles?: string[];
    appKey?: string;
    requiresAuth?: boolean;
    checkAppAvailability?: boolean;
    visible?: boolean | (() => boolean);
    disabled?: boolean | (() => boolean);
    onClick?: (context?: any, event?: Event) => void;
    children?: INavbarItemMenu[];
}
