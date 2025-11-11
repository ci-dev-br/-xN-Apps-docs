import { Component, Injector } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { EditarComponent, WindowModule, WindowService } from '@ci/components';
import { CoreModule, DaoBuilder, DaoService } from '@ci/core';
import { Organizacao } from '@ci/portal-api';

@Component({
    selector: 'ci-home',
    imports: [
        CoreModule,
        MatTabsModule,
        MatButtonModule,
        MatDialogModule,
        WindowModule,
    ],
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    constructor(
        private readonly dialog: MatDialog,
        private readonly daoBuilder: DaoBuilder,
        private readonly daos: DaoService,
        private readonly route: ActivatedRoute,
        private readonly window: WindowService,
        private readonly injector: Injector,
    ) { }
    async cadastrarOrganizacao() {

    }
    async editar(data: Organizacao, event?: MouseEvent) {
        const result: number | any = await this.window.open(EditarComponent,
            { schemaName: 'Org', data }, 'Organizacao', event)
        // if (result === -1 && this.source) {
        //     let pos = this.source.indexOf(data);
        //     this.source?.splice(pos, 1);
        // }
    }
    async createNew() {
        let instance: Organizacao = {} as Organizacao;
        const data: number | any = await this.editar(instance);
        // if (!(typeof data === 'number') && (!!data?.internalId || !!data?.id)) // TODO: revisar esta regra
        //     this.source = [data, ...this.source || []];
    }
}
