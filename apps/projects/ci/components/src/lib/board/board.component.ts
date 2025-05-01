import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { UserService } from "@ci/auth";
import { DaoFormService, DaoService, IChangeable } from "@ci/core";
import { Prancheta, PranchetaService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-board',
    template: `
        @if(form){<div class="board-wrap" [formGroup]="form" > 
            <ci-input mode="content-editable" fieldName="title" label="Título"  el="h1"></ci-input>
        </div>}
    `,
    styleUrls: [
        'board.component.scss',
    ],
    standalone: false,
})
export class BoardComponent implements OnInit {
    form?: FormGroup;
    @Input() default?: string;
    constructor(
        private readonly daoForms: DaoFormService,
        private readonly user: UserService,
        private readonly pranchetas: PranchetaService,
        private readonly daos: DaoService,
    ) { }
    async ngOnInit() {
        await this.loadBoard();
        this.form = await this.daoForms.getForm('Prancheta');
        this.daos.prepareToEdit(this.prancheta);
        this.daos.bindDataForm(this.prancheta, this.form);

        this.daos.confirmation(this.prancheta)?.subscribe(async data => {
            try {
                if (this.prancheta && data && this.form) {
                    let _data: any = Object.assign(this.prancheta,
                        await lastValueFrom(this.pranchetas.pranchetaControllerSync({ body: { prancheta: this.prancheta } }))
                    );
                    // delete (_data as IChangeable).__pre;
                    // this.daos.prepareToEdit(_data);
                    // this.daos.bindDataForm(_data, this.form);
                    // this.prancheta = _data;
                    _data;
                }
            } catch (error) {
                console.error(error);
            }
        });
        this.form.valueChanges.subscribe(v => {
            this.syncPrancheta();
        })
    }
    prancheta?: Prancheta;
    async loadBoard() {
        this.prancheta = await lastValueFrom(
            this.pranchetas.pranchetaControllerGet({ body: { defaultGlobalCode: this.default } })
        );

        if (!this.prancheta && !!this.default && ((this.user?.user?.value?.roles || []).indexOf('MASTER') > -1)) {
            this.prancheta = {
                codigoGlobal: ((this.user?.user?.value?.roles || []).indexOf('MASTER') > -1) ? this.default : undefined,
            };
            await lastValueFrom(
                this.pranchetas.pranchetaControllerSync({ body: { prancheta: this.prancheta } })
            )
        } else {
            // if (!!this.default) {
            //     this.pranchetas.pranchetaControllerGet({ body: { defaultGlobalCode: this.default } });
            // }
        }
    }

    async syncPrancheta() {
        if (this.prancheta && this.form?.valid) {
            await this.daos.confirmChanges(this.prancheta);
        } else {
            this.form?.markAllAsTouched();
        }
    }
}