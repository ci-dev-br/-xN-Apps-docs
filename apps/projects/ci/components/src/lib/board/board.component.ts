import { Component, HostListener, Inject, Injector, Input, OnInit, Optional } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { UserAuthenticationService } from "@ci/auth";
import { DaoBuilder, DaoService } from "@ci/core";
import { Card, Prancheta, PranchetaService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { CardSetting, ImplCard } from "./card";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { WindowService } from "../window/window.service";
import { CardFinderComponent } from "../card-finder/card-finder.component";
import { SettingsComponent } from "@ci/components";
/**
 * Componente de Visualização de Prancheta para construção de Dashboards
 * dinâmico com Cartões Extensíveis e Configuráveis por Multi-Inquilinos
 * da Aplicação;
 */
@Component({
    selector: 'ci-board',
    templateUrl: 'board.component.html',
    styleUrl: 'board.component.scss',
    standalone: false,
})
export class BoardComponent implements OnInit {
    form?: FormGroup;
    @Input() default?: string;
    cards = new Map<string, ImplCard>();
    constructor(
        @Optional() private readonly window?: WindowService,
        @Optional() private readonly daoForms?: DaoBuilder,
        @Optional() private readonly user?: UserAuthenticationService,
        @Optional() private readonly pranchetas?: PranchetaService,
        @Optional() private readonly daos?: DaoService,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() private readonly injector?: Injector,
        @Optional() @Inject(CardSetting) public cardsFound?: ImplCard[],
    ) {
        this.cardsFound?.forEach(c => {
            if (!!c && !!c?.componentName) {
                this.cards.set((c?.componentName || ''), c);
            }
        })
    }
    async ngOnInit() {
        try {
            await this.loadBoard();
            this.form = await this.daoForms?.getForm('Prancheta');
            this.daos?.prepareToEdit(this.prancheta);
            if (this.form) this.daos?.bindDataForm(this.prancheta, this.form);

            this.daos?.confirmation(this.prancheta)?.subscribe(async data => {
                this.syncing = true;
                try {
                    if (this.prancheta && data && this.form && this.pranchetas) {
                        const prancheta_syncronized = await lastValueFrom(this.pranchetas.pranchetaControllerSync({ body: { prancheta: this.prancheta } }));

                        let _data: any = Object.assign(this.prancheta, prancheta_syncronized);
                        // delete (_data as IChangeable).__pre;
                        // this.daos.prepareToEdit(_data);
                        // this.daos.bindDataForm(_data, this.form);
                        // this.prancheta = _data;
                        _data;
                    }
                } catch (error) {
                    console.trace(error);
                }
                this.syncing = false;
            });
            this.form?.valueChanges.subscribe(v => {
                if (!this.syncing) this.syncPrancheta();
            })
        } catch (error) {
            console.trace(error);
        }
    }
    syncing?: boolean;
    prancheta?: Prancheta;
    async loadBoard() {
        if (!this.pranchetas) return;
        this.prancheta = await lastValueFrom(
            this.pranchetas.pranchetaControllerGet({ body: { defaultGlobalCode: this.default } })
        );
        if (!this.prancheta && !!this.default && ((this.user?.user?.value?.roles || []).indexOf('MASTER') > -1)) {
            this.prancheta = {
                codigoGlobal: ((this.user?.user?.value?.roles || []).indexOf('MASTER') > -1) ? this.default : undefined,
            } as any;
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
            if (!this.syncing) await this.daos?.confirmChanges(this.prancheta);
        } else {
            this.form?.markAllAsTouched();
        }
    }
    component(card: Card): ImplCard | undefined {
        try {
            return this.cards.get(card.componentName || '') as ImplCard;
        } catch (error) {

        }
        return undefined;
    }
    async findCardToAdd() {
        const cardFinderDialog = this.dialog?.open(CardFinderComponent);
        cardFinderDialog?.afterClosed().subscribe(value => {
            if (!!this.prancheta && !!value) {
                if (!this.prancheta.cards) this.prancheta.cards = [];
                this.prancheta.cards.push(value);
                this.syncPrancheta();
            }
        })
    }
    edittingCard?: Card;
    @HostListener('window:click')
    clickHandler() {
        //  this.edittingCard = undefined;
    }
    drop(event: any) {
        if (!!this.prancheta?.cards) moveItemInArray(this.prancheta.cards, event.previousIndex, event.currentIndex);
        this.syncPrancheta();
    }
    get layout() {
        return this.prancheta?.layout
        // return this.prancheta?.layout?.split(',')?.map(d => Number(d))
    }
    async openSettings() {
        this.window?.open(SettingsComponent,
            { pranchetas: [this.prancheta] },
            'Editar Pranchetas'
        )
    }
}