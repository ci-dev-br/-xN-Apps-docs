import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, Input, Optional } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthModule } from '@ci/auth';
import { LNavModule } from '@ci/components';
import { IAction } from '@ci/components/action';
import { DataGridModule } from '@ci/components/data-grid';
import { DynFormModule } from '@ci/components/dyn-form';
import { EditarDetailComponent, EditarDetailModule } from '@ci/components/editar-detail';
import { WindowModule, WindowService } from '@ci/components/window';
import { CoreModule, DaoService, IAmSchematization } from '@ci/core';
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
        @Optional() private readonly windows?: WindowService,
        @Optional() private readonly service?: LancamentoFinanceiroService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly route?: ActivatedRoute,
        @Optional() private readonly daos?: DaoService,
    ) { }
    schemaName = 'LancamentoFinanceiro';
    entidades = [
    ]
    @Input()
    actions?: IAction<unknown>[] = [
        {
            icon: 'home',
            onClick: () => {
                this.router?.navigate(['/Financeiro/'])
            }
        },
        {
            description: 'Adicionar',
            children: [
                {
                    description: 'Novo Lançamento',
                    onClick: async () => {
                        if (!this.service) return;
                        let new_instance: LancamentoFinanceiro = {} as LancamentoFinanceiro;
                        let new_instance_result: any = await lastValueFrom((this.service).sync({ body: { data: new_instance } }));
                        // this.daos?.prepareToEdit(new_instance_result); ? deve ou não preparar o dado quando novo ?
                        this.windows?.open(EditarDetailComponent, {
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
                this.router?.navigate(['LancamentoFinanceiro'], {
                    relativeTo: this.route
                })
            }
        }
    ]
}
