import { CommonModule } from '@angular/common';
import { Component, ComponentRef, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthModule, UserService } from '@ci/auth';
import { FooterModule, NavbarModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { Application, User } from '@ci/portal-api';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SidebarSettings } from './sidebar-settings/sidebar-settings.components';
import { MatFormFieldModule } from '@angular/material/form-field';
const XD = <T>(a: T) => {
    (a as any).___styles_xd__internals = {
        m: { l: 0, r: 0, t: 0, b: 0 },
    };
    return a;
};
@Component({
    selector: 'ci-homepage',
    imports: [
        CommonModule,
        RouterModule,
        CoreModule,
        AuthModule,
        NavbarModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatFormFieldModule,
        FooterModule,
    ],
    templateUrl: './homepage.component.html',
    standalone: true,
    styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
    constructor(
        protected readonly userService: UserService,
        private render: Renderer2,
        private el: ElementRef<Element>,
        private readonly router: Router,
        private readonly dialog: MatDialog,
    ) { }
    protected categorias?: any[];
    protected apps?: Application[];
    protected bgs = [
        '/bg-apps-290847.jpg'
    ]
    ngOnInit(): void {
        this.mountStyle();
        this.userService.user.subscribe(user => this.updateUser(user))
    }
    protected bg?: string;
    async mountStyle() {
        this.bg = this.bgs[Math.round((this.bgs.length - 1) * Math.random())];
    }
    private updateUser(user: User | null) {
        //
        this.apps = [
            // XD({ name: 'Meus Apps', url: '/meus-apps' }),
        ]
    }
    protected async appClickHandler(event: any, app: any) {
        if (event.ctrlKey) {
            window.open(location.href + '/' + app.url, '')
        } else {
            this.router.navigate([app.url], {/*  relativeTo: this.route */ });
        }
    }
    protected openSidebarSettings() {
        this.dialog.open(SidebarSettings, {

            data: {
                origin: this
            }
        });
    }
}
