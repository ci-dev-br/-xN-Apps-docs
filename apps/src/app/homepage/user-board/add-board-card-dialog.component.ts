import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IBoardCardDef } from './board-cards.registry';

export interface AddBoardCardDialogData {
    availableCards: IBoardCardDef[];
    alreadyAddedCardIds: string[];
    activeAppKeys: string[];
}

@Component({
    selector: 'ci-add-board-card-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatTooltipModule,
    ],
    templateUrl: './add-board-card-dialog.component.html',
    styleUrls: ['./add-board-card-dialog.component.scss']
})
export class AddBoardCardDialogComponent implements OnInit {
    searchTerm = '';
    selectedCategory = 'Todos';
    categories: string[] = ['Todos'];
    filteredCards: IBoardCardDef[] = [];

    constructor(
        public dialogRef: MatDialogRef<AddBoardCardDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AddBoardCardDialogData
    ) { }

    ngOnInit(): void {
        const catSet = new Set<string>();
        this.data.availableCards.forEach(c => {
            if (c.appName) catSet.add(c.appName);
        });
        this.categories = ['Todos', ...Array.from(catSet)];
        this.applyFilter();
    }

    applyFilter(): void {
        const search = (this.searchTerm || '').trim().toLowerCase();
        this.filteredCards = this.data.availableCards.filter(card => {
            const matchesCat = this.selectedCategory === 'Todos' || card.appName === this.selectedCategory;
            const matchesSearch = !search ||
                card.title.toLowerCase().includes(search) ||
                card.description.toLowerCase().includes(search) ||
                card.appName.toLowerCase().includes(search) ||
                card.tags.some(t => t.toLowerCase().includes(search));
            return matchesCat && matchesSearch;
        });
    }

    filterByCategory(cat: string): void {
        this.selectedCategory = cat;
        this.applyFilter();
    }

    isCardAdded(cardId: string): boolean {
        return this.data.alreadyAddedCardIds.includes(cardId);
    }

    addCard(card: IBoardCardDef): void {
        this.dialogRef.close({ action: 'add', card });
    }

    close(): void {
        this.dialogRef.close();
    }
}
