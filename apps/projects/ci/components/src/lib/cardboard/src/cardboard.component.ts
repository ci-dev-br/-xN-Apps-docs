import { Component, Input, Type } from "@angular/core";

@Component({
    selector: 'ci-cardboard',
    standalone: false,
    styleUrl: 'cardboard.component.scss',
    templateUrl: 'cardboard.component.html'
})
export class CardboardComponent {
    private _cardInfo?: any | undefined;
    public get cardInfo(): any | undefined {
        return this._cardInfo;
    }
    @Input()
    public set cardInfo(value: any | undefined) {
        if (this._cardInfo === value) return;
        this._cardInfo = value;
        if (value && value.componentName)
            this.componentRef = this.board?.cards.get(value.componentName)?.componentRef;
    }
    @Input() componentRef?: Type<Component>;
    @Input() board?: any;
    constructor(
    ) { }
    async editCard(card: any, event: Event) {
        if (!this.board) return;
        if (this.board.edittingCard === card) {
            this.board.edittingCard = undefined;
        } else {
            this.board.edittingCard = card;
        }
        event.preventDefault();
        event.stopPropagation();
    }
    async removeCard(card: any, event: Event) {
        if (this.board?.prancheta && this.board?.prancheta?.cards) {
            const pos = this.board?.prancheta?.cards.indexOf(card);
            if (pos > -1) this.board?.prancheta?.cards.splice(pos, 1);
        }
        this.board?.syncPrancheta();
    }
}