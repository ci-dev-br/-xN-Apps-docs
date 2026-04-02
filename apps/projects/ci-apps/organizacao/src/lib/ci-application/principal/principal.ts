import { AfterViewInit, Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { EditarDetailComponent, WindowModule, WindowService } from "@ci/components";
import { MasterDetailModule } from "@ci/components/master-detail";
import { CoreModule } from "@ci/core";
import { Organizacao, OrganizacaoService } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-org-principal',
    templateUrl: 'principal.html',
    imports: [
        CoreModule,
        WindowModule,
        MatButtonModule,
        MasterDetailModule,
    ],
    styleUrl: 'principal.scss',
    standalone: true,
})
export class Principal implements AfterViewInit, OnInit {
    load = new BehaviorSubject(true);
    organizationsCreatedByYou?: Organizacao[];
    constructor(
        private readonly window: WindowService,
        private readonly organizacao: OrganizacaoService,
    ) {

    }
    async cadastrarOrganizacao() {
        this.createNew();
    }
    async ngAfterViewInit() {

    }
    async editar(data: Organizacao, event?: MouseEvent) {
        const result: number | any = await this.window.open(
            EditarDetailComponent,
            { schemaName: 'Organizacao', data },
            'Organizacao',
            event);
        return result;
    }
    async ngOnInit() {
        try {
            this.organizationsCreatedByYou = await lastValueFrom(this.organizacao.getList({
                body: {
                    where: {}, skip: 0, take: 1
                }
            }));
        } catch (error) {
            console.error(error);
        }
        this.load.next(false);
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