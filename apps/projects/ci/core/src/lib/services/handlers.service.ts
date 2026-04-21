import { Injectable } from "@angular/core";

export class AtOf {
    constructor(
        set: { at: any, of: any }
    ) {
        Object.assign(this, set)
    }
}
/**
 * 
 */
@Injectable()
export class Handlers {
    constructor(

    ) { }
    getHandler(name: string, origem: any) {

        return undefined;
    }
    registryHandler(name: string, handler: Function,) {

    }
}