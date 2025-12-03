import { MatIconModule } from "@angular/material/icon";
import { APPS, IApp } from "../apps";
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@ci/auth';
import { CoreModule } from "@ci/core";
import { MatButtonModule } from "@angular/material/button";
@Component({
    selector: 'ci-apps-lista',
    template: `
     @for (app of apps; track $index) {
    <div class="app" [tabindex]="$index" (contextmenu)="contextMenuHanlder($event)"
        (keydown.enter)="appClickHandler($event, app)" (click)="appClickHandler($event, app)"
        [attr.aria-labelledby]="app.description">
        <div class="bg" [style.border-color]="app.color"></div>
        <span class="header">
            @if(app.icon){
            @if(app.type === 'svg' && !!app.icon){
            <mat-icon [svgIcon]="app.icon" [inline]="true"></mat-icon>
            }@else{
            <mat-icon [inline]="true">{{app.icon}}</mat-icon>
            }
            }
            <span class="label">
                {{app.name}}
            </span>
        </span>
        @if(!!app?.description){
        <span class="description">
            {{app.description}}
        </span>
        }
    </div>
    }
    <div class="app">
        <mat-icon [inline]="true">add</mat-icon>
    </div>
    `,
    standalone: true,
    imports: [
        CoreModule,
        MatIconModule,
        MatButtonModule,
    ],
    styleUrl: 'lista.scss'
})
export class Lista {
    apps?: IApp[];
    constructor(
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) { }
    async ngOnInit() {
        this.userService.user.subscribe(user => {
            if (!!user) {
                this.apps = APPS.filter(app => !!this.userService && !!this.userService.user && !!this.userService.user.value ?
                    this.userService.user?.value?.roles?.find(role => app.roles && app.roles.indexOf(role) > -1) : false);
            } else {
                // this.router.navigate(['/']);
            }
        })
    }
    async appClickHandler(event: any, app: any) {
        if (event.ctrlKey) {
            window.open(location.href + '/' + app.url, '')
        } else {
            this.router.navigate([app.url], {/*  relativeTo: this.route */ });
        }
    }
    /// @HostListener('window:contextmenu', ['$event'])
    contextMenuHanlder(event: MouseEvent | PointerEvent | Event) {
        event.preventDefault;
    }

    @HostListener('keyup', ['$event'])
    keyUpHandler(e: KeyboardEvent) {
        if (e.key == 'PrintScreen') {
            navigator.clipboard.writeText('');
            alert('Screenshots disabled!');
        }
    };

    @HostListener('keydown', ['$event'])
    keyDownHandler(e: KeyboardEvent) {
        if (e.ctrlKey && e.key == 'p') {
            alert('This section is not allowed to print or export to PDF');
            e.cancelBubble = true;
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };
}