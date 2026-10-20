import {
    Component,
    OnInit,
    OnDestroy,
    Optional,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { UserAuthenticationService } from '@ci/auth';
import { ApplicationCatalogService } from '@ci/core';
import { CI_STATIC_APPS, IApp } from '../../painel/apps/apps';
import {
    BOARD_CARDS_CATALOG,
    IBoardCardDef,
    createGenericAppCardDef
} from './board-cards.registry';
import { AddBoardCardDialogComponent } from './add-board-card-dialog.component';

export interface IActiveBoardCard {
    instanceId: string;
    defId: string;
    appKey: string;
    cardDef: IBoardCardDef;
}

@Component({
    selector: 'ci-user-board',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatSnackBarModule,
    ],
    templateUrl: './user-board.component.html',
    styleUrls: ['./user-board.component.scss']
})
export class UserBoardComponent implements OnInit, OnDestroy {
    activeCards: IActiveBoardCard[] = [];
    activeAppKeys: Set<string> = new Set<string>();
    isLoggedIn = false;

    private subscriptions = new Subscription();

    constructor(
        @Optional() private readonly userService?: UserAuthenticationService,
        @Optional() private readonly catalogService?: ApplicationCatalogService,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() private readonly snackBar?: MatSnackBar,
        private readonly cdr?: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Monitora usuário logado
        if (this.userService?.user) {
            this.subscriptions.add(
                this.userService.user.subscribe(user => {
                    this.isLoggedIn = !!user && !!user.id;
                    if (this.isLoggedIn) {
                        this.catalogService?.refreshMyActivations().subscribe();
                    }
                    this.cdr?.markForCheck();
                })
            );
        }

        // Monitora aplicativos ativos para atualizar cards permitidos no board
        if (this.catalogService?.activatedApps$) {
            this.subscriptions.add(
                this.catalogService.activatedApps$.subscribe(activeSet => {
                    this.activeAppKeys = new Set(activeSet);
                    this.loadBoardState();
                    this.cdr?.markForCheck();
                })
            );
        } else {
            this.loadBoardState();
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private getStorageKey(): string {
        const userId = this.userService?.user?.value?.id || 'guest';
        return `ci_homepage_user_board_${userId}`;
    }

    loadBoardState(): void {
        const storageKey = this.getStorageKey();
        const savedJson = localStorage.getItem(storageKey);

        if (savedJson) {
            try {
                const savedIds: string[] = JSON.parse(savedJson);
                const allAvailable = this.getAvailableCardDefs();
                const restored: IActiveBoardCard[] = [];

                for (const defId of savedIds) {
                    const foundDef = allAvailable.find(c => c.id === defId);
                    if (foundDef && this.isAppActive(foundDef.appKey)) {
                        restored.push({
                            instanceId: `${defId}_${Date.now()}_${Math.random()}`,
                            defId: defId,
                            appKey: foundDef.appKey,
                            cardDef: foundDef
                        });
                    }
                }

                this.activeCards = restored;
                return;
            } catch (e) {
                console.warn('Falha ao restaurar cards do board do localStorage:', e);
            }
        }

        // Se não há estado salvo, cria um conjunto inicial padrão com base nos apps ativos
        this.initializeDefaultCards();
    }

    private initializeDefaultCards(): void {
        const defaultCards: IActiveBoardCard[] = [];
        const available = this.getAvailableCardDefs();

        // Se Financeiro estiver ativo, sugere Panorama Econômico e Cotações Recentes
        if (this.isAppActive('Financeiro')) {
            const macro = available.find(c => c.id === 'fin_macro_indicators');
            if (macro) {
                defaultCards.push({
                    instanceId: `init_${macro.id}`,
                    defId: macro.id,
                    appKey: macro.appKey,
                    cardDef: macro
                });
            }
            const quotes = available.find(c => c.id === 'fin_recent_quotes');
            if (quotes) {
                defaultCards.push({
                    instanceId: `init_${quotes.id}`,
                    defId: quotes.id,
                    appKey: quotes.appKey,
                    cardDef: quotes
                });
            }
        }

        this.activeCards = defaultCards;
        this.saveBoardState();
    }

    private saveBoardState(): void {
        const storageKey = this.getStorageKey();
        const cardDefIds = this.activeCards.map(c => c.defId);
        localStorage.setItem(storageKey, JSON.stringify(cardDefIds));
    }

    private isAppActive(appKey: string): boolean {
        if (!this.isLoggedIn) {
            // Em modo não logado ou convidado, exibe os cards públicos de finanças
            return appKey === 'Financeiro';
        }
        return this.activeAppKeys.has(appKey);
    }

    /**
     * Retorna a lista completa de cards disponíveis para os aplicativos ativos do usuário
     */
    getAvailableCardDefs(): IBoardCardDef[] {
        const result: IBoardCardDef[] = [];

        // 1. Cards nativos catalogados (ex: Financeiro)
        for (const def of BOARD_CARDS_CATALOG) {
            if (this.isAppActive(def.appKey)) {
                result.push(def);
            }
        }

        // 2. Cards rápidos para os demais aplicativos estáticos ativos do usuário
        for (const app of CI_STATIC_APPS) {
            const key = app.name || app.url?.replace(/^\//, '');
            if (key && key !== 'Financeiro' && this.isAppActive(key)) {
                result.push(createGenericAppCardDef(app));
            }
        }

        return result;
    }

    openAddCardDialog(): void {
        const available = this.getAvailableCardDefs();

        if (available.length === 0) {
            this.snackBar?.open(
                'Você ainda não possui aplicativos ativos para adicionar cards. Acesse a Loja para ativar aplicativos!',
                'OK',
                { duration: 4500 }
            );
            return;
        }

        const dialogRef = this.dialog?.open(AddBoardCardDialogComponent, {
            width: '840px',
            maxWidth: '94vw',
            data: {
                availableCards: available,
                alreadyAddedCardIds: this.activeCards.map(c => c.defId),
                activeAppKeys: Array.from(this.activeAppKeys)
            }
        });

        dialogRef?.afterClosed().subscribe(res => {
            if (res?.action === 'add' && res.card) {
                this.addCardToBoard(res.card);
            }
        });
    }

    addCardToBoard(cardDef: IBoardCardDef): void {
        if (this.activeCards.some(c => c.defId === cardDef.id)) {
            this.snackBar?.open('Este card já está presente no seu board.', 'Fechar', { duration: 3000 });
            return;
        }

        this.activeCards.push({
            instanceId: `${cardDef.id}_${Date.now()}`,
            defId: cardDef.id,
            appKey: cardDef.appKey,
            cardDef: cardDef
        });

        this.saveBoardState();
        this.snackBar?.open(`Card "${cardDef.title}" adicionado ao seu Board!`, 'OK', { duration: 3000 });
        this.cdr?.markForCheck();
    }

    removeCard(card: IActiveBoardCard): void {
        this.activeCards = this.activeCards.filter(c => c.instanceId !== card.instanceId);
        this.saveBoardState();
        this.snackBar?.open(`Card removido do Board.`, 'Desfazer', { duration: 3500 }).onAction().subscribe(() => {
            this.activeCards.push(card);
            this.saveBoardState();
            this.cdr?.markForCheck();
        });
        this.cdr?.markForCheck();
    }

    resetDefaultBoard(): void {
        localStorage.removeItem(this.getStorageKey());
        this.initializeDefaultCards();
        this.snackBar?.open('Board restaurado para o layout padrão.', 'OK', { duration: 3000 });
        this.cdr?.markForCheck();
    }
}
