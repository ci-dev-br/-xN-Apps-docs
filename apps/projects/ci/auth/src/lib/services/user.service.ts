import { Injectable } from "@angular/core";
import { AuthService, User } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { StorageService } from "@ci/core";

@Injectable()
export class UserService {
    private $user = new BehaviorSubject<User | undefined>(undefined);
    constructor(
        private readonly router: Router,
        private readonly storage: StorageService,
        private readonly authService: AuthService,
    ) {
        this.$user.subscribe(v => {
            try {
                if (v) {
                    try {
                        const { photo, ...user_info } = v;
                        localStorage.setItem('CIUSR', btoa(JSON.stringify(user_info, null, 2)));
                    } catch (error) {
                    }
                } else {
                    try {
                        localStorage.removeItem('CIUSR');
                        // router.navigate(['/']);
                    } catch (error) {
                    }
                }
            } catch (error) {
                console.error(error);
            }
        });
        (async () => await this.getFromMemory())();
    }
    get user() { return this.$user; }
    async identificarUsuario(user: User) {
        this.$user.next(user);
    }
    async sair() {
        this.storage.clean();
        this.$user.next(undefined);
        this.router.navigate(['/']);
    }
    private async getFromMemory() {
        try {
            let profile = await lastValueFrom(this.authService.profile());
            this.$user.next(profile);
            return profile;
        } catch (error) {
            this.router.navigate(['/']);
        }
        return undefined;
    }
}