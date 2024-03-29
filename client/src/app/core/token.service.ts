import { Injectable } from "@angular/core";
import { UserService } from "../services/user.service";

@Injectable()
export class TokenService {
    constructor(
    ) { }
    clear() {
        localStorage.clear();
        sessionStorage.clear();
        // TODO: verificar chamada indevida que está derrubando a autenticação, foi removido o clear automático para retorno 401;
    }
    hasToken() {
        return !!this.Token;
    }
    hasRefreshToken() {
        return !!this.RefreshToken;
    }

    get Token() {
        return this.get('token');
    }
    get RefreshToken() {
        return this.get('refresh_token');
    }

    set Token(value: string) {
        this.set('token', value);
    }
    set RefreshToken(value: string) {
        this.set('refresh_token', value);
    }

    private getStorage() {
        let storage_data = undefined;
        try {
            storage_data = localStorage.getItem('0');
        } catch (error) {

        }
        if (!storage_data) return {};
        return JSON.parse(atob(storage_data));
    }
    private __?: any = this.getStorage();
    private get storage() {
        const snapshot = JSON.stringify(this.__);
        setTimeout(() => {
            // ~> retorno para análise console.log(this.__);
            try {
                if (snapshot !== JSON.stringify(this.__))
                    localStorage.setItem('0', btoa(JSON.stringify(this.__, null, 2)))
            } catch (error) {

            }
        }, 0);
        return this.__;
    }
    private set(property_name: string, value: string) {
        this.storage[property_name] = value;
    }
    private get(property_name: string) {
        return this.storage[property_name];
    }
}