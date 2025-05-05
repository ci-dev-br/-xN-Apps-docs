import { Component, HostListener, Inject, Injector, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "@ci/auth";
import { DaoBuilder, DaoService } from "@ci/core";
import { Card, Prancheta, PranchetaService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { CardFinderComponent } from "./card-finder/card-finder.component";
import { CardSetting, ImplCard } from "./card";

@Component({
    selector: 'ci-board',
    templateUrl: 'board.component.html',
    styleUrls: [
        'board.component.scss',
    ],
    standalone: false,
})
export class BoardComponent implements OnInit {
    form?: FormGroup;
    @Input() default?: string;
    constructor(
        private readonly daoForms: DaoBuilder,
        private readonly user: UserService,
        private readonly pranchetas: PranchetaService,
        private readonly daos: DaoService,
        private readonly dialog: MatDialog,
        private readonly injector: Injector,
        @Inject(CardSetting)
        public cardsFound?: ImplCard[],
    ) {
        this.cardsFound?.forEach(c => {
            this.cards.set(c.componentName || '', c);
        })
    }
    cards = new Map<string, ImplCard>();
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
    component(card: Card): ImplCard {
        return this.cards.get(card.componentName || '') as ImplCard;
    }
    async findCardToAdd() {
        const cardFinderDialog = this.dialog.open(CardFinderComponent);
        cardFinderDialog.afterClosed().subscribe(value => {
            if (!!this.prancheta && !!value) {
                if (!this.prancheta.cards) this.prancheta.cards = [];
                this.prancheta.cards.push(value);
                this.syncPrancheta();
            }
        })
    }
    edittingCard?: Card;
    async editCard(card: Card, event: Event) {
        this.edittingCard = card;
        event.preventDefault();
        event.stopPropagation();
    }
    async removeCard(card: Card) {
        if (this.prancheta && this.prancheta.cards) {
            const pos = this.prancheta.cards.indexOf(card);
            if (pos > -1) this.prancheta.cards.splice(pos, 1);
        }
    }
    @HostListener('window:click')
    clickHandler() {
        this.edittingCard = undefined;
    }
}