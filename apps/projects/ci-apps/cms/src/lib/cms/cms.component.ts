import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { CoreModule } from "@ci/core";
import { BoardModule } from "@ci/components";
import { models } from "../models";
import { DataGridModule } from "@ci/components/data-grid";
import { WindowModule } from "@ci/components/window";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
    selector: 'ci-cms',
    imports: [
        CoreModule,
        RouterModule,
        DataGridModule,
        BoardModule,
        MatToolbarModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        WindowModule,
        MatListModule,
        MatDividerModule,
        MatTooltipModule,
    ],
    standalone: true,
    styleUrl: 'cms.component.scss',
    templateUrl: `cms.component.html`
})
export class CMSComponent implements OnInit, OnDestroy {
    entidades = models;
    private t?: string;

    ngOnInit() {
        this.t = document.title;
        document.title = `CMS :: Gestor de Conteúdo`;
    }

    ngOnDestroy() {
        if (this.t) document.title = this.t;
    }
}
