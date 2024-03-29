import { Injectable, OnInit } from "@angular/core";
import { AuthService, User, UserService as UserApiService } from "@portal/api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { TokenService } from "../core/token.service";

@Injectable()
export class UserService {
    private $user = new BehaviorSubject<User | undefined>(this.getFromMemory());
    constructor(
        private readonly router: Router,
        private readonly tokenService: TokenService,
        private readonly userApiService: UserApiService,
        private readonly authService: AuthService,
    ) {
        this.$user.subscribe(v => {
            try {
                if (v) {
                    try {
                        localStorage.setItem('CIUSR', btoa(JSON.stringify(v, null, 2)));
                    } catch (error) {
                    }
                } else {
                    try {
                        localStorage.removeItem('CIUSR'); router.navigate(['/']);
                    } catch (error) {
                    }
                }
            } catch (error) {
                console.error(error);
            }
        })
    }
    get user() { return this.$user; }
    async identificarUsuario(user: User) {
        this.$user.next(user);
    }
    async sair() {
        this.tokenService.clear();
        this.$user.next(undefined);
    }
    private getFromMemory() {
        let cached = undefined;
        try {
            cached = localStorage.getItem('CIUSR');
        } catch (error) {
        }
        if (cached) {
            setTimeout(async () => {
                this.$user.next(await lastValueFrom(
                    this.authService.profile()
                ));
            }, 0);
            return {
                ...JSON.parse(atob(cached))
            } as User;
        } return undefined;
    }
}