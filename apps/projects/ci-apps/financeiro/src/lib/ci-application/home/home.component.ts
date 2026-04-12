import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthModule } from '@ci/auth';
import { DynFormModule, EditarDetailComponent, IAction, LNavModule, WindowModule, WindowService } from '@ci/components';
import { DataGridModule } from '@ci/components/data-grid';
import { EditarDetailModule } from '@ci/components/editar-detail';
import { CoreModule, IAmSchematization } from '@ci/core';
import { LancamentoFinanceiro, LancamentoFinanceiroService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        WindowModule,
        EditarDetailModule,
        CoreModule,
        DataGridModule,
        RouterModule,
        MatToolbarModule,
        MatButtonToggleModule,
        LNavModule,
        AuthModule,
        MatSidenavModule,
        LayoutModule,
        MatMenuModule,
        ReactiveFormsModule,
        DynFormModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements IAmSchematization {
    constructor(
        private readonly windows: WindowService,
        private readonly service: LancamentoFinanceiroService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) { }
    schemaName = 'LancamentoFinanceiro';
    entidades = [
    ]
    @Input()
    actions?: IAction<unknown>[] = [
        {
            description: 'Adicionar',
            children: [
                {
                    description: 'Novo Lançamento',
                    onClick: async () => {
                        let new_instance: LancamentoFinanceiro = {} as LancamentoFinanceiro;
                        let new_instance_result: any = await lastValueFrom((this.service).sync({ body: { data: new_instance } }))
                        this.windows
                            .open(EditarDetailComponent, {
                                schemaName: this.schemaName,
                                data: new_instance_result
                            },
                                this.schemaName);
                    }
                },
            ]
        },
        {
            description: 'Consultar Lançamentos',
            onClick: (e) => {
                this.router.navigate(['LancamentoFinanceiro'], {
                    relativeTo: this.route
                })
            }
        }
    ]
}
