import { Component } from "@angular/core";
import { EditarDetailComponent, WindowService } from "@ci/components";
import { Organizacao } from "@ci/portal-api";

@Component({
    selector: 'ci-org-principal',
    templateUrl: 'principal.html',
    standalone: true,
})
export class Principal {
    constructor(
        private readonly window: WindowService,
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
        let instance: Organizacao = {} as Organizacao;
        const finalData: number | any = await this.editar(instance);
        return finalData;
    }
}