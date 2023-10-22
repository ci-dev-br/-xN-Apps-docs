import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDialogModule } from "@angular/material/dialog";
import { NgxQRCodeModule } from '@jonyadamit/ngx-qrcode-ivy';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CoreModule } from "src/app/core/core.module";
import { LNavModule } from "src/app/components/l-nav/l-nav.module";
import { EditarAplicativoComponent } from './editar-aplicativo/editar-aplicativo.component';
import { GerencialComponent } from "./gerencial.component";
import { JanelaModule } from "src/app/components/janela/janela.module";
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [
        GerencialComponent,
        EditarAplicativoComponent,
    ],
    imports: [
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
        JanelaModule,
        RouterModule.forChild([
            {
                path: '', component: GerencialComponent, data: {
                    name: 'Gerenciador de Aplicações e Políticas de Uso'
                }
            }
        ])
    ]
})
export class GerencialModule { }