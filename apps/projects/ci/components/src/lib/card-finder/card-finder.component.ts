import { Component, Inject, Optional } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CardSetting, ImplCard } from "../board/card";
@Component({
    selector: 'ci-card-finder',
    templateUrl: 'card-finder.component.html',
    styleUrl: 'card-finder.component.scss',
    standalone: false,
})
export class CardFinderComponent {
    lista?: ImplCard[];
    constructor(
        private readonly dialogRef: MatDialogRef<CardFinderComponent>,
        @Optional() @Inject(CardSetting)
        private readonly cards?: ImplCard[],
    ) { }
    async adicionar(card: ImplCard) {
        this.dialogRef.close(card);
    }
    find(search: string) {
        this.lista = [...this.cards || []]?.filter(c => {
            return (c?.title || '')
                .toLocaleLowerCase()
                .indexOf(
                    search.toLowerCase()
                ) > -1 ||
                (c.descricao || '')
                    .toLocaleLowerCase()
                    .indexOf(
                        search.toLowerCase()
                    ) > -1 ||
                (c.tags && c.tags.find(t => t.toLowerCase().indexOf(search.toLowerCase()) > -1))
        })
    }
}