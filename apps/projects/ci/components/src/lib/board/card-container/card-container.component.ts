import { Component, EventEmitter, Input, Optional, Output, Type } from "@angular/core";
import { Card, Prancheta } from "@ci/portal-api";
import { BoardComponent } from "../board.component";

@Component({
    selector: 'ci-card-container',
    standalone: false,
    styleUrl: 'card-container.component.scss',
    templateUrl: 'card-container.component.html'
})
export class CardContainerComponent {
    constructor(
        @Optional() protected readonly board: BoardComponent,
    ) { }
    @Input() edittingCard?: Card;
    private _card?: Card | undefined;
    public get card(): Card | undefined {
        return this._card;
    }
    @Input()
    public set card(value: Card | undefined) {
        if (this._card === value) return;
        this._card = value;
        if (value && value.componentName)
            this.componentRef = this.board.cards.get(value.componentName)?.componentRef;
    }
    @Input() prancheta?: Prancheta;
    @Input() componentRef?: Type<Component>;
    async editCard(card: Card, event: Event) {
        if (this.board.edittingCard === card) {
            this.board.edittingCard = undefined;
        } else {
            this.board.edittingCard = card;
        }
        event.preventDefault();
        event.stopPropagation();
    }
    async removeCard(card: Card, event: Event) {
        if (this.board?.prancheta && this.board?.prancheta?.cards) {
            const pos = this.board?.prancheta?.cards.indexOf(card);
            if (pos > -1) this.board?.prancheta?.cards.splice(pos, 1);
        }
        this.board?.syncPrancheta();
    }
}