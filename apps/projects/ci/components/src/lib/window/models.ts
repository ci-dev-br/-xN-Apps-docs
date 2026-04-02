import { Type } from "@angular/core";

export interface IWindowData {
    data?: any;
    [key: string]: any;
}
export interface IMenuItem {
    component?: Type<any>;
    icon?: string;
    label?: string;
    path?: string;
    children?: IMenuItem[];
    onClick?: (...args: any) => void;
    visible?: () => boolean;
}