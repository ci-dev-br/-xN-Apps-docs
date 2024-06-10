import { Injectable, OnInit } from "@angular/core";
import { HmacSHA512, SHA512 } from "crypto-js";

@Injectable()
export class StorageService implements OnInit {
    constructor() { }
    ngOnInit(): void {

    }
    store(key: string, value: any) {
        try {
            localStorage.setItem(
                SHA512(key).toString(),
                btoa(
                    JSON.stringify(value, null, 2)
                )
            )
        } catch (error) {

        }
    }
    restore(key: string) {
        try {
            let a = localStorage.getItem(
                SHA512(key).toString()
            );
            if (a) {
                return JSON.parse(atob(a));
            }
        } catch (error) {
        }
    }
}
