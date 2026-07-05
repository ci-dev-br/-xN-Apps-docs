import { Inject, Injectable, Optional, PLATFORM_ID } from "@angular/core";
import { AuthService, User } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { StorageService, NotificationService } from "@ci/core";
import { isPlatformBrowser } from "@angular/common";
import { TechnicolorShader } from "three/examples/jsm/Addons.js";

@Injectable()
export class UserAuthenticationService {
    private isBrowser;
    /**
     * Serviço para gerenciamento do usuário autenticado.
     */
    private $user = new BehaviorSubject<User | undefined>((() => {
        if (typeof localStorage !== 'undefined') {
            let stored = localStorage.getItem('CIUSR');
            try {
                if (!!stored) return JSON.parse(atob(stored))
            } catch (error) {
                console.trace(error);
            }
        }
        return undefined
    })());
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Optional() private readonly authService?: AuthService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly storage?: StorageService,
        @Optional() private readonly notification?: NotificationService,
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        if (!this.isBrowser) return;
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
                    // if (localStorage) localStorage.setItem('CIUSR', btoa(JSON.stringify(user_info, null, 2)));
                    this.SetupUserPreferences(user);
                    this.notification?.requestPermission();
                } else {
                    // TODO: este trecho esta causando falha na credenciação inicial
                    // mesmo com estre trecho comentado, o comportamento permanece
                    // if (typeof localStorage !== 'undefined') localStorage.// removeItem('CIUSR');
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
        if (this.authService) this.$user.next(await lastValueFrom(this.authService.profile()));
    }
    /**
     * Encerra a sessão do usuário atual.
     */
    async sair() {
        this.storage?.clean();
        this.$user.next(undefined);
        setTimeout(() => this.router?.navigate(['/']));
    }
    /**
     * Tenta obter o perfil do usuário a partir do serviço de autenticação.
     */
    private async getFromMemory() {
        // let profile: User | null = null;
        // try {
        //     if (this.authService)
        //         profile = await lastValueFrom(this.authService.profile());
        // } catch (error) {
        //     console.trace(error);
        //     // this.router.navigate(['/']);
        // }
        // if (!!profile) {
        //     this.$user.next(profile);
        //     return profile;
        // } else {
        //     this.$user.next(undefined);
        //     // setTimeout(() => {
        //     //     this.router.navigate(['/']);
        //     // })
        //     return undefined;
        // }
    }
    private async SetupUserPreferences(user: User) {
        // TODO: get user preferences
    }
}