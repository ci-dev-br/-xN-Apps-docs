import { Component, Input, Type } from "@angular/core";
import { ImplCard } from "../../board/card";

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

    constructor() { }

    public get cardDef(): ImplCard | undefined {
        if (!this.cardInfo?.componentName || !this.board?.cards) return undefined;
        return this.board.cards.get(this.cardInfo.componentName);
    }

    public get cardInputs(): Record<string, any> {
        const def = this.cardDef;
        return {
            ...(def?.defaultInputs || {}),
            ...(this.cardInfo?.settings || {}),
            ...(this.cardInfo?.inputs || {})
        };
    }

    public get cardTitle(): string {
        return this.cardInfo?.title || this.cardDef?.title || this.cardInfo?.componentName || 'Card';
    }

    public get cardCategory(): string {
        return this.cardDef?.category || 'Geral';
    }

    public get cardIcon(): string {
        return this.cardDef?.icon || 'widgets';
    }

    public get cols(): number {
        return this.cardInfo?.cols || this.cardDef?.dimensions?.cols || 1;
    }

    public toggleWidth(event: Event): void {
        event.stopPropagation();
        const current = this.cols;
        // Cicla entre 1, 2 e 3 colunas
        this.cardInfo.cols = current === 1 ? 2 : (current === 2 ? 3 : 1);
        this.board?.syncPrancheta();
    }

    private mount() {
        if (this.cardInfo && this.cardInfo.componentName && this.board) {
            this.componentRef = this.board?.cards?.get(this.cardInfo.componentName)?.componentRef;
        }
        if (!this.componentRef) {
            // Silently fallback if component not in registry
        }
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
        event.preventDefault();
        event.stopPropagation();
        if (this.board?.prancheta && this.board?.prancheta?.cards) {
            const pos = this.board.prancheta.cards.indexOf(card);
            if (pos > -1) {
                this.board.prancheta.cards.splice(pos, 1);
            }
        }
        this.board?.syncPrancheta();
    }
}
