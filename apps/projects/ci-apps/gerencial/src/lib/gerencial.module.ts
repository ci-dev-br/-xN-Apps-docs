import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
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
import { CoreModule } from "@ci/core";
import { LNavModule, StatusBarModule } from "@ci/components";
import { EditarAplicativoComponent } from './editar-aplicativo/editar-aplicativo.component';
import { GerencialComponent } from "./gerencial.component";
import { WindowModule } from "@ci/components";
import { MatTooltipModule } from '@angular/material/tooltip';
import { GridModule } from "@ci/components";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MobFakeComponent } from "./mob-fake/mob-fake.component";
import { MobFakeModule } from "./mob-fake/mob-fake.module";
import { ApplicationManagerComponent } from "./views/application-manager/application-manager.component";
import { GerecialSettingsComponent } from "./views/settings/gerecial-settigns.component";

import { DevicesComponent } from "./views/devices/devices.component";
import { UsersComponent } from "./views/users/users.component";

const routes: Routes = [
    {
        path: '', component: GerencialComponent,
        data: {
            name: 'Gerenciador de Aplicações e Usuários',
            role: 'MASTER',
        },
        children: [
            { path: 'devices', component: DevicesComponent, data: { title: 'Dispositivos', icon: 'smartphone' } },
            // { path: 'settings', component: undefined },
            { path: 'applications', component: ApplicationManagerComponent, data: { title: 'Apps', icon: 'apps' } },
            { path: 'user-manager', component: UsersComponent, data: { title: 'Gestão de Usuários', icon: 'badge' } },
        ]
    },
    {
        path: 'mob-fake',
        component: MobFakeComponent,
    }
];

@NgModule({
    declarations: [
        GerencialComponent,
        EditarAplicativoComponent,
    ],
    imports: [
        ApplicationManagerComponent,
        GerecialSettingsComponent,
        DevicesComponent,
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
        StatusBarModule,
        RouterModule.forChild(routes)
    ]
})
export class GerencialModule { }