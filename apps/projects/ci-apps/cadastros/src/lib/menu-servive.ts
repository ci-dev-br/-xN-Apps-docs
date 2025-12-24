import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    constructor() {
    }
    opened = new BehaviorSubject<boolean>(true);
}