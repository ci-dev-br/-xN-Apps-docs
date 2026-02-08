import { Injectable, OnInit, Optional } from "@angular/core";
import { AuthService, User } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { StorageService } from "@ci/core";

@Injectable()
export class UserService {
    /**
     * Serviço para gerenciamento do usuário autenticado.
     */
    private $user = new BehaviorSubject<User | null>((() => {
        if (typeof localStorage !== 'undefined') {
            let stored = localStorage.getItem('CIUSR');
            try {
                if (!!stored) return JSON.parse(atob(stored))
            } catch (error) {
                console.trace(error);
            }
        }
        return null
    })());
    constructor(
        private readonly authService: AuthService,
        private readonly router?: Router,
        private readonly storage?: StorageService,
    ) {
        this.init();
    }
    /**
     * Inicializa o serviço de usuário, configurando a assinatura para mudanças no usuário atual.
     */
    async init() {
        this.$user.subscribe(user => {
            try {
                if (!!user) {
                    const { /* photo,    */...user_info } = user;
                    if (localStorage) localStorage.setItem('CIUSR', btoa(JSON.stringify(user_info, null, 2)));
                } else {
                    if (typeof localStorage !== 'undefined') localStorage.removeItem('CIUSR');
                }
            } catch (error) {
                console.trace(error);
            }
        });
        if (typeof localStorage !== 'undefined')
            this.getFromMemory();
    }
    /** 
     * Retorna o usuário atual como um Observable.
     */
    get user() { return this.$user; }
    /**
     *  Identifica o usuário atual no sistema.
     * @param user 
     */
    async identificarUsuario(user: User) {
        this.$user.next(await lastValueFrom(this.authService.profile()));
    }
    /**
     * Encerra a sessão do usuário atual.
     */
    async sair() {
        this.storage?.clean();
        this.$user.next(null);
        setTimeout(() => this.router?.navigate(['/']));
    }
    /**
     * Tenta obter o perfil do usuário a partir do serviço de autenticação.
     */
    private async getFromMemory() {
        let profile: User | null = null;
        try {
            profile = await lastValueFrom(this.authService.profile());
        } catch (error) {
            console.trace(error);
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