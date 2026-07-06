import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Menu service
 */
@Injectable({ providedIn: 'root' })
export class MenuService {
    readonly userMenu: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    constructor() { }

}