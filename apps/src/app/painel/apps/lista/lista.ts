import { MatIconModule } from "@angular/material/icon";
import { CI_STATIC_APPS, IApp } from "../apps";
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@ci/auth';
import { CoreModule } from "@ci/core";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
@Component({
    selector: 'ci-apps-lista',
    templateUrl: 'lista.html',
    standalone: true,
    imports: [
        CoreModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
    ],
    styleUrl: 'lista.scss'
})
export class Lista {
    apps?: IApp[];
    appsFiltered?: IApp[];
    searchControl: FormControl = new FormControl(undefined, {
        validators: [],
    });
    constructor(
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) { }
    async ngOnInit() {
        this.userService.user.subscribe(user => {
            if (!!user) {
                this.apps = CI_STATIC_APPS.filter(app => !!this.userService && !!this.userService.user && !!this.userService.user.value ?
                    this.userService.user?.value?.roles?.find(role => app.roles && app.roles.indexOf(role) > -1) : false);
            } else {
                // this.router.navigate(['/']);
            }
        });
        this.searchControl.valueChanges.subscribe((value: string) => {
            if (!!value && value.trim().length > 0) {
                this.appsFiltered = this.apps?.filter(x => {
                    if (JSON.stringify(x).toLocaleLowerCase()
                        .indexOf(value.toLocaleLowerCase()) > -1)
                        return true;
                    else
                        return false
                })
            } else {
                this.appsFiltered = undefined;
            }
        });
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
    @ViewChild('searchInputElement')
    searchInputElement?: ElementRef<HTMLInputElement>;
    @HostListener('window:keydown', ['$event'])
    focus(ke: KeyboardEvent) {
        this.searchInputElement?.nativeElement.focus();
    }

}