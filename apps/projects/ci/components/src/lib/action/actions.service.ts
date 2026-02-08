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
    private _actions?: Map<string, IAction<unknown>> = new Map();
    async setAction(code: string, extas: IAction<any>) {
        this._actions?.set(code, extas);
    }
    async setActions(actions: IAction<any>[]) {
        actions.forEach((act, i) => {
            this._actions?.set(act.code || '' + i, act);
        })
    }
    async removeActions(codes: string[]) {
        codes.forEach(action_code => this.removeAction(action_code))
    }
    async removeAction(action_code: string) {
        this._actions?.delete(action_code);
    }
}