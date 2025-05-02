import { Component, Inject, Optional } from "@angular/core";
import { CardSetting, ImplCard } from "../card";
import { MatDialogRef } from "@angular/material/dialog";
@Component({
    selector: 'ci-card-finder',
    templateUrl: 'card-finder.component.html',
    styleUrl: 'card-finder.component.scss',
    standalone: false,
})
export class CardFinderComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<CardFinderComponent>,
        @Optional() @Inject(CardSetting)
        public cardsFound?: ImplCard[],
    ) { }
    async adicionar(card: ImplCard) {
        this.dialogRef.close(card);
    }
}