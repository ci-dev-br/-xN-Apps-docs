import { Component, Input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { RouterModule } from "@angular/router";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-views',
    standalone: true,
    imports: [
        CoreModule,
        MatTabsModule,
        RouterModule,
        MatIconModule,
    ],
    template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
    @if(abas){
    @for (aba of abas; track aba) {
    <a mat-tab-link [routerLink]="aba.path">
        @if(aba.icon){<mat-icon>
            {{aba.icon}}
        </mat-icon>}
        {{aba.label}}</a>
    }
    }
    <!--  <a mat-tab-link disabled>Disabled Link</a> -->
    </nav>
    <mat-tab-nav-panel #tabPanel>
        <router-outlet></router-outlet>
    </mat-tab-nav-panel>
   <!--  <ci-status-bar></ci-status-bar> -->
    `
})
export class ViewsComponent {
    @Input() abas?: any;
}