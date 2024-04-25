import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDialogModule } from "@angular/material/dialog";
import { NgxQRCodeModule } from '@jonyadamit/ngx-qrcode-ivy';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { CoreModule } from "src/app/core/core.module";
import { LNavModule } from "src/app/components/l-nav/l-nav.module";
import { EditarAplicativoComponent } from './editar-aplicativo/editar-aplicativo.component';
import { GerencialComponent } from "./gerencial.component";
import { WindowModule } from "src/app/components/window/window.module";
import { MatTooltipModule } from '@angular/material/tooltip';
import { GridModule } from "src/app/components/grid/grid.module";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MobFakeComponent } from "./mob-fake/mob-fake.component";
import { MobFakeModule } from "./mob-fake/mob-fake.module";
import { ApplicationManagerComponent } from "./views/application-manager/application-manager.component";
import { GerecialSettingsComponent } from "./views/settings/gerecial-settigns.component";
import { UsersComponent } from "./views/users/users.component";

@NgModule({
    declarations: [
        GerencialComponent,
        EditarAplicativoComponent,
    ],
    imports: [
        ApplicationManagerComponent,
        GerecialSettingsComponent,
        UsersComponent,
        CoreModule,
        NgxQRCodeModule,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        MatDialogModule,
        MatTableModule,
        LNavModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatInputModule,
        WindowModule,
        GridModule,
        MatButtonToggleModule,
        FormsModule,
        MatSelectModule,
        MatChipsModule,
        MobFakeModule,
        RouterModule.forChild([
            {
                path: '', component: GerencialComponent,
                data: {
                    name: 'Gerenciador de Aplicações e Usuários',
                    role: 'MASTER'
                }
            },
            {
                path: 'mob-fake',
                component: MobFakeComponent,
            }
        ])
    ]
})
export class GerencialModule { }