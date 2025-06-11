import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-cms',
    imports: [
        CoreModule,
        RouterModule,
        MatToolbarModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
    ],
    standalone: true,
    styleUrl: 'cms.component.scss',
    template: `
<mat-toolbar>
    <button mat-icon-button (click)="sideMenu.toggle()">
        <mat-icon>menu</mat-icon>
    </button>
    <button mat-raised-button>
        <mat-icon>dashboard</mat-icon>
        Visão Geral
    </button>
    <button mat-raised-button>
        <mat-icon>create</mat-icon>
        Novo
    </button>
</mat-toolbar>
<mat-drawer-container >
    <mat-drawer #sideMenu mode="over" opened>
        @for(item of models; track item){
        <button mat-menu-item [routerLink]="'./' + item">{{item}}</button>
        }
    </mat-drawer>
    <mat-drawer-content>
        <router-outlet></router-outlet>
    </mat-drawer-content>
</mat-drawer-container>
    `
})
export class CMSComponent implements OnInit, OnDestroy {
    models = [
        'CommentMeta',
        'Comment',
        'Links',
        'SitePage',
        'SiteOption',
        'SitePost',
        'TermMeta',
        'Term',
        'Website',
    ]
    private t = document.title;
    ngOnInit(): void {
        document.title = `${this.t} :: CMS`;
    }
    ngOnDestroy(): void {
        document.title = this.t;
    }
}