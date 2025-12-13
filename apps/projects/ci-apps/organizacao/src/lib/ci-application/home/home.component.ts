import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { EditarDetailComponent, WindowModule, WindowService } from '@ci/components';
import { CoreModule } from '@ci/core';
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
        private readonly window: WindowService,
    ) { }
    async cadastrarOrganizacao() {
        this.createNew();
    }
    async editar(data: Organizacao, event?: MouseEvent) {
        const result: number | any = await this.window.open(
            EditarDetailComponent,
            { schemaName: 'Organizacao', data },
            'Organizacao',
            event);
        return result;
    }
    async createNew() {
        let instance: Organizacao = {} as Organizacao;
        const finalData: number | any = await this.editar(instance);
        return finalData;
    }
}
