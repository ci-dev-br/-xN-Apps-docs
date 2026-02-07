import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { EditarDetailComponent, WindowModule, WindowService } from "@ci/components";
import { CoreModule } from "@ci/core";
import { Organizacao, OrganizacaoService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-org-principal',
    templateUrl: 'principal.html',
    imports: [
        CoreModule,
        WindowModule,
        MatButtonModule,
    ],
    styleUrl: 'principal.scss',
    standalone: true,
})
export class Principal {
    constructor(
        private readonly window: WindowService,
        private readonly organizacao: OrganizacaoService,
    ) {

    }
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
        try {
            let instance: Organizacao = {
                deleted: true,
            } as Organizacao;
            instance = (await lastValueFrom(this.organizacao.sync({ body: { data: instance } }))) as Organizacao;
            setTimeout(() => {
                instance.deleted = null;
            }, 2000);
            const finalData: number | any = (await this.editar(instance));
            return finalData;
        } catch (error) {
            console.trace(error);
        }
    }
}