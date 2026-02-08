import { Component, EventEmitter, Input, Optional, Output } from "@angular/core";
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
    @Input() card?: Card;
    @Input() prancheta?: Prancheta;
    async editCard(card: Card, event: Event) {
        this.board.edittingCard = card;
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