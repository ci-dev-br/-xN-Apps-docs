import { NgModule } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { CoreModule } from "@ci/core";
import { RouterModule } from "@angular/router";
import { IconModule } from "../icon/icon.module";
import { LogoComponent } from "../logo/logo.component";
import { NavbarComponent } from "./navbar.component";

@NgModule({
    declarations: [
        NavbarComponent,
    ],
    imports: [
        CoreModule,
        IconModule,
        LogoComponent,
        MatToolbarModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        RouterModule,
    ],
    exports: [
        NavbarComponent,
    ],

})
export class NavbarModule { }
export {
    NavbarComponent,
    IconModule,
    LogoComponent,
}