import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { InputModule } from '@ci/components';
import { CoreModule, DaoService, IChangeable } from '@ci/core';
import { User, UserService } from '@ci/portal-api';
import { AuthModule, UserService as AuthUserService } from '@ci/auth';
import { lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CoreModule,
        InputModule,
        MatCardModule,
        ReactiveFormsModule,
        AuthModule,
        MatButtonModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    private user?: User;
    form: FormGroup = this.formBuilder.group({
        fullName: [],
        email: [],
        emailVerificado: [],
        id: [],
        permission: [],
        phone: [],
        photo: [],
        refreshToken: [],
        roles: [],
        tenants: [],
        username: [],
    })
    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly daos: DaoService,
        private readonly userService: UserService,
        private readonly authUserService: AuthUserService,
    ) { }
    ngOnInit(): void {
        this.authUserService.user.subscribe(user => { this.hasUser(user || undefined) })
    }
    hasUser(user?: User) {
        if (!!user) {
            // TODO: separar bloco
            this.daos.prepareToEdit(user);
            this.daos.bindDataForm(user, this.form);
            this.daos.confirmation(user)?.subscribe(async data => {
                try {
                    if (user && data) {
                        let _data: any = Object.assign(user,
                            await lastValueFrom(this.userService.syncUser({ body: user }))
                        );
                        delete (_data as IChangeable).__pre;
                        this.daos.prepareToEdit(_data);
                        this.daos.bindDataForm(_data, this.form);
                        this.user = _data;
                    }
                } catch (error) {
                    console.error(error);
                }
            });
            this.user = user;
        }
    }
    async saveProfile() {
        if (this.user && this.form.valid) {
            await this.daos.confirmChanges(this.user);
        } else {
            this.form.markAllAsTouched();
        }
    }
}
