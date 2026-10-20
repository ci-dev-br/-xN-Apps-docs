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
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { GruposModalComponent } from "../grupos-modal/grupos-modal.component";

import { MatBadgeModule } from "@angular/material/badge";
import { MatDividerModule } from "@angular/material/divider";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
        NavbarComponent,
    ],
    imports: [
        CommonModule,
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
        MatTooltipModule,
        MatDialogModule,
        MatBadgeModule,
        MatDividerModule,
        GruposModalComponent,
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