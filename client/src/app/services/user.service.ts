import { Injectable, OnInit } from "@angular/core";
import { User } from "../api/models";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";

@Injectable()
export class UserService {
    private $user = new BehaviorSubject<User | undefined>(this.getFromMemory());
    constructor(
        private readonly router: Router,
    ) {
        this.$user.subscribe(v => {
            if (v) {
                localStorage.setItem('CIUSR', btoa(JSON.stringify(v, null, 2)));
                router.navigate(['/painel']);
            } else { localStorage.removeItem('CIUSR'); router.navigate(['/']); }
        })
    }
    get user() { return this.$user; }
    async identificarUsuario(user: User) {
        this.$user.next(user);
    }
    async sair() {
        this.$user.next(undefined);
    }
    private getFromMemory() {
        const cached = localStorage.getItem('CIUSR');
        if (cached) {
            return {
                ...JSON.parse(atob(cached))
            } as User;
        } return undefined;
    }
}