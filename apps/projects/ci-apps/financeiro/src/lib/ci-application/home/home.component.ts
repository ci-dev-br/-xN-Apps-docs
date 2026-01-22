import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { EditarDetailComponent, GridModule, IAction, WindowModule, WindowService } from '@ci/components';
import { EditarDetailModule } from '@ci/components/editar-detail';
import { CoreModule } from '@ci/core';

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
        GridModule,
        RouterModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatIconModule,
        MatButtonModule,
        WindowModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    constructor(
        private readonly windows: WindowService,
    ) { }
    schemaName = 'LancamentoFinanceiro';
    entidades = [
    ]
    @Input()
    actions?: IAction<unknown>[] = [
        {
            description: 'Novo Lançamento',
            onClick: () => {
                this.windows
                    .open(EditarDetailComponent, {
                        schemaName: this.schemaName,
                        data: {}
                    },
                        this.schemaName);
            }
        }
    ]
}
