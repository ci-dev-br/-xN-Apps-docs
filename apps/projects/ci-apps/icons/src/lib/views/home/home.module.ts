import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { HomeComponent } from "./home.component";
import { CoreModule } from "@ci/core";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        CoreModule,
        MatIconModule,
        MatButtonModule,
        RouterModule.forChild([
            { path: '', component: HomeComponent }
        ])
    ],
    declarations: [
        HomeComponent,
    ],
    exports: [
        HomeComponent,
    ],
})
export class HomeModule { }