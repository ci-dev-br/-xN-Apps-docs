import { Injectable, OnInit } from "@angular/core";
import { User } from "@portal/api";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { TokenService } from "../core/token.service";

@Injectable()
export class UserService {
    private $user = new BehaviorSubject<User | undefined>(this.getFromMemory());
    constructor(
        private readonly router: Router,
        private readonly tokenService: TokenService,
    ) {
        this.$user.subscribe(v => {
            if (v) {
                sessionStorage.setItem('CIUSR', btoa(JSON.stringify(v, null, 2)));
            } else { sessionStorage.removeItem('CIUSR'); router.navigate(['/']); }
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
        const cached = sessionStorage.getItem('CIUSR');
        if (cached) {
            return {
                ...JSON.parse(atob(cached))
            } as User;
        } return undefined;
    }
}