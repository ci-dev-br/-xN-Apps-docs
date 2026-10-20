import { Component, Inject, OnInit, Optional } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CardSetting, ImplCard } from "../board/card";
import { organizeCardMetadata } from "../board/cards.registry";

export interface CardFinderDialogData {
    alreadyAddedCardNames?: string[];
    customCards?: ImplCard[];
}

@Component({
    selector: 'ci-card-finder',
    templateUrl: 'card-finder.component.html',
    styleUrl: 'card-finder.component.scss',
    standalone: false,
})
export class CardFinderComponent implements OnInit {
    lista: ImplCard[] = [];
    allCards: ImplCard[] = [];
    categories: string[] = ['Todos'];
    selectedCategory = 'Todos';
    searchTerm = '';
    alreadyAdded: Set<string> = new Set<string>();

    constructor(
        private readonly dialogRef: MatDialogRef<CardFinderComponent>,
        @Optional() @Inject(CardSetting)
        private readonly cards?: ImplCard[],
        @Optional() @Inject(MAT_DIALOG_DATA)
        public data?: CardFinderDialogData,
    ) { }

    ngOnInit(): void {
        const rawList = [...(this.data?.customCards || this.cards || [])];
        this.allCards = rawList.map(c => organizeCardMetadata(c));

        if (this.data?.alreadyAddedCardNames) {
            this.alreadyAdded = new Set(this.data.alreadyAddedCardNames);
        }

        const catSet = new Set<string>();
        this.allCards.forEach(c => {
            if (c.category) catSet.add(c.category);
        });
        this.categories = ['Todos', ...Array.from(catSet)];

        this.applyFilter();
    }

    async adicionar(card: ImplCard) {
        this.dialogRef.close(card);
    }

    isCardAdded(card: ImplCard): boolean {
        return !!card.componentName && this.alreadyAdded.has(card.componentName);
    }

    filterByCategory(cat: string): void {
        this.selectedCategory = cat;
        this.applyFilter();
    }

    find(search: string) {
        this.searchTerm = search || '';
        this.applyFilter();
    }

    applyFilter(): void {
        const search = (this.searchTerm || '').trim().toLowerCase();
        this.lista = this.allCards.filter(c => {
            const matchesCat = this.selectedCategory === 'Todos' || c.category === this.selectedCategory;
            const matchesSearch = !search ||
                (c.title || '').toLowerCase().includes(search) ||
                (c.descricao || '').toLowerCase().includes(search) ||
                (c.category || '').toLowerCase().includes(search) ||
                (c.tags && c.tags.some(t => t.toLowerCase().includes(search)));
            return matchesCat && matchesSearch;
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
