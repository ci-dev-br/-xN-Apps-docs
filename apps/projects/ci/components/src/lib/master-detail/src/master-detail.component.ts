import { AfterViewInit, Component, Injector, Input, OnDestroy, OnInit, Optional } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GridBuilder } from "@ci/components/data-grid";
import { EditarDetailComponent } from "@ci/components/editar-detail";
import { WindowService } from "@ci/components/window";
import { DaoBuilder, DaoService, IAmSchematization, } from "@ci/core";
import { getServiceAsSchema } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

/**
 *  # Componente de Master-Detail para exibição e edição de dados.
 *
 * Este componente oferece uma interface para visualizar e gerenciar dados de uma entidade (schema).
 * Ele pode exibir os dados em formato de tabela (`table`) ou lista (`list`) e permite a edição
 * e criação de novos registros através de um componente de detalhe (`EditarDetailComponent`).
 *
 * ## Funcionalidades:
 * - **Exibição de Dados:** Carrega e exibe dados de um `schemaName` especificado.
 * - **Visualização Configurável:** Permite alternar entre visualização em tabela e lista.
 * - **Edição de Registros:** Abre um modal (`EditarDetailComponent`) para editar um registro existente.
 * - **Criação de Registros:** Permite criar um novo registro, abrindo o modal de edição com um objeto vazio.
 * - **Sincronização de Título:** Atualiza o título da página com base no `schemaName` quando o componente é carregado.
 * - **Integração com DAO:** Utiliza `DaoBuilder` e `DaoService` para interagir com a API e buscar/salvar dados.
 * - **Configuração de Grid:** Gera automaticamente as colunas da grade com base no esquema da entidade.
 
 */
@Component({
    selector: 'ci-master-detail',
    standalone: false,
    styleUrl: 'master-detail.component.scss',
    templateUrl: 'master-detail.component.html'
})
export class MasterDetailComponent<T> implements OnInit, AfterViewInit, OnDestroy, IAmSchematization {
    searchDefault?: any;
    @Input()
    visualizacao?: 'table' | 'list' = 'table';
    @Input()
    schemaName: string = undefined!;
    @Input()
    gridOptions?: any/* IDataGridOptions<T> */;
    service?: any;
    private order?: any;
    constructor(
        @Optional() private daoBuilder?: DaoBuilder,
        @Optional() private daos?: DaoService,
        @Optional() private route?: ActivatedRoute,
        @Optional() private window?: WindowService,
        @Optional() private injector?: Injector,
        @Optional() private gridb?: GridBuilder,
        // @Optional() private actions?: ActionsService,
    ) { }
    source?: T[] = [{} as any];
    async loadGrid() {
        if (!!this.schemaName && this.daoBuilder) {
            const properties = await (await this.daoBuilder.getSchema(this.schemaName)).properties;
            this.gridOptions = await this.gridb?.FromSchema(this.schemaName);
            // this.gridOptions = {
            //     columns: [
            //         ...Object.keys(properties || {}).map(property => {
            //             const headerName = properties ? properties[property].title : property;
            //             const fieldName = property;
            //             return {
            //                 headerName,
            //                 fieldName,
            //                 format: ((properties as any)[property]?.format || undefined) as any,
            //                 hide: fieldName && [
            //                     /* Commons to ignore */
            //                     'internalId',
            //                     'id',
            //                     'createdAt',
            //                     'createdBy',
            //                     'lastModifiedAt',
            //                     'lastModifiedBy',
            //                     'tenants',
            //                     'deleted'].indexOf(fieldName) > -1
            // 
            //             } as /* IColumnOption<any> */ any
            //         })
            //     ]
            // }
        }
    }
    async ngAfterViewInit() {
        if (!!this.schemaName) this.prepareSchema();
    }
    private oTitle?: string;
    ngOnDestroy(): void {
        if (!!document && this.oTitle) document.title = this.oTitle;
    }
    async ngOnInit() {
        /*  this.actions?.setAction('confirmation', {
             label: 'Cornfimar alterações',
             icon: 'done-all',
             onClick: (element) => {
                 element;
             }
         }) */
        this.route?.data.subscribe(async (data: any) => {
            if (!!data.schema) {
                this.schemaName = data.schema;
                this.searchDefault = data.search;
                await this.prepareSchema();
            }
        });
        this.route?.params.subscribe(async (params: any) => {
            if (!!params.EntityName && typeof params.EntityName === 'string') {
                this.schemaName = params.EntityName;
                await this.prepareSchema();
            }
        });
    }
    async prepareSchema() {
        if (this.schemaName && !!document?.title && !this.oTitle && this.schemaName) {
            this.oTitle = document.title;
            document.title = `${this.oTitle} - ${this.schemaName}`
        }
        await this.loadGrid();
        if (!!this.schemaName) {
            let serviceType = getServiceAsSchema(this.schemaName);
            if (serviceType) {
                this.service = this.injector?.get(serviceType);
            }
        }
        this.search();
        this.source;
    }
    async search() {
        if (this.service && this.service.getList)
            this.source = await this.daos?.read(await lastValueFrom(this.service.getList({ body: { ...(this.searchDefault || {}) } })), this.schemaName);
    }
    async editar(data: T, event?: Event) {
        // TODO: refatorar para chamada da janela de edição, passando o componente de edição como parâmetro, para evitar dependência direta do componente de edição 
        const result: number | any = await this.window?.open(EditarDetailComponent,
            { schemaName: this.schemaName, data }, this.schemaName, event)
        if (result === -1 && this.source) {
            let pos = this.source.indexOf(data);
            this.source?.splice(pos, 1);
        }
    }
    async createNew() {
        if (this.service) {
            let instance: T = await this.service.sync({});
            const data: number | any = await this.editar(instance);
            if (!(typeof data === 'number') && (!!data?.internalId || !!data?.id))
                this.source = [data, ...this.source || []];
        }
    }
    async sortHandle(event: any) {
        this.order = event;
        this.search();
    }
}
