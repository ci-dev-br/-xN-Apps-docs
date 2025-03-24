import { Injectable, OnInit, Optional } from "@angular/core";
import { AuthService, User } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { StorageService } from "@ci/core";

@Injectable()
export class UserService {
    private $user = new BehaviorSubject<User | null>((() => {
        if (localStorage) {
            let stored = localStorage.getItem('CIUSR');
            try {
                if (!!stored) return JSON.parse(atob(stored))
            } catch (error) {
                console.error(error);
            }
        }
        return null
    })());
    constructor(
        private readonly authService: AuthService,
        private readonly router?: Router,
        private readonly storage?: StorageService,
    ) {
        this.init()
    }
    async init() {
        this.$user.subscribe(user => {
            try {
                if (!!user) {
                    const { photo, ...user_info } = user;
                    if (localStorage) localStorage.setItem('CIUSR', btoa(JSON.stringify(user_info, null, 2)));
                } else {
                    if (localStorage) localStorage.removeItem('CIUSR');
                }
            } catch (error) {
                console.error(error);
            }
        });
        if (localStorage)
            this.getFromMemory();
    }

    get user() { return this.$user; }
    async identificarUsuario(user: User) {
        this.$user.next(await lastValueFrom(this.authService.profile()));
    }
    async sair() {
        this.storage?.clean();
        this.$user.next(null);
        setTimeout(() => this.router?.navigate(['/']));
    }
    private async getFromMemory() {
        let profile: User | null = null;
        try {
            profile = await lastValueFrom(this.authService.profile());
        } catch (error) {
            console.error(error);
            // this.router.navigate(['/']);
        }
        if (!!profile) {
            this.$user.next(profile);
            return profile;
        } else {
            this.$user.next(null);
            // setTimeout(() => {
            //     this.router.navigate(['/']);
            // })
            return undefined;
        }
    }
}