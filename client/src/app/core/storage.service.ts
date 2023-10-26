
import { Injectable } from '@angular/core';
@Injectable()
export class StorageService {
    session: any = this.SESSION() || {};
    constructor() { }
    set(key: string, value: any) {
        this.session[key] = btoa(JSON.stringify(value));
        let session_data = btoa(JSON.stringify(this.session, null, 2));
        sessionStorage.setItem('SESSION[0]', session_data);
    }
    get(key: string) {
        return JSON.parse(atob(this.session[key]));
    }
    private SESSION() {
        const session_b64 = localStorage.getItem('SESSION[0]');
        if (session_b64) {
            const session = JSON.parse(atob(session_b64));
            return session;
        }
    }
}