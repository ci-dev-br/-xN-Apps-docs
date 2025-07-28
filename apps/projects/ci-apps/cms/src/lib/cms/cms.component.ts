import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { CoreModule } from "@ci/core";
import { BoardModule, GridModule, WindowModule } from "@ci/components";
import { models } from "../models";

@Component({
    selector: 'ci-cms',
    imports: [
        CoreModule,
        RouterModule,
        GridModule,
        BoardModule,
        MatToolbarModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        WindowModule,
    ],
    standalone: true,
    styleUrl: 'cms.component.scss',
    templateUrl: `cms.component.html`
})
export class CMSComponent implements OnInit, OnDestroy {
    entidades = models;
    private t?: string;
    ngOnInit() {
        document.title = `${this.t} :: CMS`;
    }
    ngOnDestroy() {
        if (this.t) document.title = this.t;
    }
}