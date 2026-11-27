import { Type } from "@angular/core";

export interface IWindowData {
    data?: any;
    [key: string]: any;
}
export interface IMenuItem {
    component?: Type<any>;
    icon?: string;
    label?: string;
    description?: string;
    tooltip?: string;
    path?: string;
    children?: IMenuItem[];
    onClick?: (...args: any) => void;
    visible?: () => boolean;
    disabled?: boolean | (() => boolean);
    checked?: boolean | (() => boolean);
    divider?: boolean;
    color?: 'primary' | 'accent' | 'warn';
}