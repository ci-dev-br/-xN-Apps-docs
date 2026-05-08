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
        this.mount();
    }
    @Input() componentRef?: Type<Component>;
    private _board?: any;
    public get board(): any {
        return this._board;
    }
    @Input()
    public set board(value: any) {
        if (this._board === value) return;
        this._board = value;
        this.mount();
    }
    constructor(
    ) { }
    private mount() {
        if (this.cardInfo && this.cardInfo.componentName && this.board)
            this.componentRef = this.board?.cards.get(this.cardInfo.componentName)?.componentRef;
        if (!this.componentRef) console.trace('Falha ao montar card.')
    }
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