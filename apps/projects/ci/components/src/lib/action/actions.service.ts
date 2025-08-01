import { Injectable } from "@angular/core";
export interface IAction<I> {
    code?: string;
    label?: string;
    description?: string;
    icon?: string;
    onClick?: (element?: I) => void;
    path?: string;
    children?: IAction<I>[];
    visible?: () => boolean;
}
@Injectable()
export class ActionsService {
    actions?: IAction<unknown>[];
    async setAction(code: string, extas?: IAction<any>) {
        this.actions = [...(this.actions || []), {
            code, ...extas
        }];
    }
}