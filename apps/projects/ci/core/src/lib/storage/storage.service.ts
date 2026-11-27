import { Injectable, OnInit } from "@angular/core";
import { SHA512 } from "crypto-js";
import {
    clearAllAuthStorage,
    decodeBase64Utf8,
    encodeBase64Utf8,
} from "../auth/client-session-storage";

@Injectable()
export class StorageService implements OnInit {
    constructor() { }
    ngOnInit(): void {

    }
    store(key: string, value: any) {
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                localStorage.setItem(
                    SHA512(key).toString(),
                    encodeBase64Utf8(JSON.stringify(value, null, 2))
                );
            }
        } catch (error) {
            console.warn('[StorageService] Falha ao persistir chave:', key, error);
        }
    }
    restore(key: string) {
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                const a = localStorage.getItem(
                    SHA512(key).toString()
                );
                if (a) {
                    return JSON.parse(decodeBase64Utf8(a));
                }
            }
        } catch (error) {
            return undefined;
        }
        return undefined;
    }
    remove(key: string) {
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                localStorage.removeItem(SHA512(key).toString());
            }
        } catch {
        }
    }
    clean() {
        clearAllAuthStorage();
    }
}
