import { MatIconModule } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { AdicionarAppDialogComponent } from "../adicionar-app-dialog/adicionar-app-dialog.component";
import { CI_STATIC_APPS, IApp } from "../apps";
import { Component, ElementRef, HostListener, ViewChild, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAuthenticationService } from '@ci/auth';
import { CoreModule, ApplicationCatalogService } from "@ci/core";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
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
        MatTooltipModule,
        MatDialogModule,
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
        private readonly userService: UserAuthenticationService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        @Optional() private readonly catalogService?: ApplicationCatalogService,
        @Optional() private readonly dialog?: MatDialog,
    ) { }
    async ngOnInit() {
        this.userService.user.subscribe(user => {
            if (!!user) {
                this.catalogService?.refreshMyActivations().subscribe();

            } else {
                // this.router.navigate(['/']);
            }
        });
        this.catalogService?.activatedApps$.subscribe(activeSet => {
            const user = this.userService?.user?.value;
            if (!user) {
                this.apps = [];
                return;
            }
            this.apps = CI_STATIC_APPS.filter(app => {
                const appKey = app.name || app.url?.replace(/^\//, '');
                return Boolean(appKey && activeSet.has(appKey));
            });
            this.applySearchFilter(this.searchControl.value);
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
    private applySearchFilter(value?: string) {
        if (!!value && value.trim().length > 0) {
            this.appsFiltered = this.apps?.filter(x => {
                return JSON.stringify(x).toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.appsFiltered = undefined;
        }
    }
    openLoja() {
        this.router.navigate(['/painel/Loja']);
    }
    openAddAppDialog() {
        this.dialog?.open(AdicionarAppDialogComponent, {
            width: '680px',
            maxWidth: '92vw',
            panelClass: 'ci-add-app-dialog-panel'
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