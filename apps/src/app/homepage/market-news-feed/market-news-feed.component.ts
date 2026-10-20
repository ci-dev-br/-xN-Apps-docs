import { Component, OnInit, OnDestroy, ChangeDetectorRef, Optional, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { News, NewsService } from '@ci/portal-api';
import { UserAuthenticationService } from '@ci/auth';
import { ComentariosComponent } from '../comentarios/comentarios';

export interface MarketCategoryFilter {
    label: string;
    value: string;
    icon?: string;
}

@Component({
    selector: 'ci-market-news-feed',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        ComentariosComponent,
    ],
    templateUrl: './market-news-feed.component.html',
    styleUrls: ['./market-news-feed.component.scss']
})
export class MarketNewsFeedComponent implements OnInit, OnDestroy {
    newsList: WritableSignal<News[]> = signal([]);
    highlightedNews: WritableSignal<News | undefined> = signal(undefined);
    showComments = signal<boolean>(false);

    isLoading = false;
    isLoadingMore = false;
    hasMore = true;
    totalLoaded = 0;
    readonly pageSize = 20;

    searchControl = new FormControl('');
    activeCategory = 'Todos';

    categories: MarketCategoryFilter[] = [
        { label: 'Todos', value: 'Todos', icon: 'dashboard' },
        { label: 'Bolsa & B3', value: 'bolsa', icon: 'trending_up' },
        { label: 'Macro & Economia', value: 'economia', icon: 'public' },
        { label: 'Câmbio & Dólar', value: 'dolar', icon: 'attach_money' },
        { label: 'Juros & Selic', value: 'selic', icon: 'account_balance' },
        { label: 'Tributário & Negócios', value: 'tributário', icon: 'receipt_long' },
    ];

    isLoggedIn = false;
    private subscriptions: any[] = [];

    constructor(
        @Optional() private readonly newsService?: NewsService,
        @Optional() private readonly userService?: UserAuthenticationService,
        @Optional() private readonly snackBar?: MatSnackBar,
        private readonly cdr?: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (this.userService) {
            const sub = this.userService.user.subscribe(user => {
                this.isLoggedIn = !!user && !!user.id;
                this.cdr?.markForCheck();
            });
            this.subscriptions.push(sub);
        }

        // Busca com debounce
        const searchSub = this.searchControl.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(() => {
            this.loadNews(true);
        });
        this.subscriptions.push(searchSub);

        this.loadNews(true);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s?.unsubscribe?.());
    }

    loadNews(reset = false): void {
        if (!this.newsService) return;
        if (reset) {
            this.isLoading = true;
            this.totalLoaded = 0;
            this.hasMore = true;
            this.cdr?.markForCheck();
        } else {
            this.isLoadingMore = true;
            this.cdr?.markForCheck();
        }

        const params = {
            search: this.searchControl.value?.trim() || undefined,
            category: this.activeCategory !== 'Todos' ? this.activeCategory : undefined,
            limit: this.pageSize,
            offset: reset ? 0 : this.totalLoaded
        };

        this.newsService.getMarketNews(params).subscribe({
            next: (data) => {
                const list = data || [];
                if (reset) {
                    this.newsList.set(list);
                    if (list.length > 0 && !this.highlightedNews()) {
                        this.highlightedNews.set(list[0]);
                    }
                } else {
                    this.newsList.update(current => [...current, ...list]);
                }

                this.totalLoaded = (reset ? 0 : this.totalLoaded) + list.length;
                this.hasMore = list.length === this.pageSize;
                this.isLoading = false;
                this.isLoadingMore = false;
                this.cdr?.markForCheck();
            },
            error: (err) => {
                console.error('Erro ao carregar notícias de mercado:', err);
                this.isLoading = false;
                this.isLoadingMore = false;
                this.cdr?.markForCheck();
            }
        });
    }

    selectCategory(category: string): void {
        if (this.activeCategory === category) return;
        this.activeCategory = category;
        this.loadNews(true);
    }

    focarNoticia(item: News): void {
        this.highlightedNews.set(item);
    }

    toggleComentarios(item: News, event?: Event): void {
        if (event) event.stopPropagation();
        if (this.highlightedNews() === item && this.showComments()) {
            this.showComments.set(false);
        } else {
            this.highlightedNews.set(item);
            this.showComments.set(true);
        }
    }

    closeComments(): void {
        this.showComments.set(false);
    }

    votar(item: News, tipo: 'UP' | 'DOWN', event?: Event): void {
        if (event) event.stopPropagation();
        if (!this.isLoggedIn) {
            this.snackBar?.open('Você precisa estar autenticado para votar em uma notícia.', 'OK', { duration: 3000 });
            return;
        }
        if (!this.newsService || !item.id) return;

        this.newsService.vote(item.id, tipo).subscribe({
            next: (stats) => {
                (item as any).upVotes = stats.upVotes;
                (item as any).downVotes = stats.downVotes;
                (item as any).userVote = stats.userVote;
                this.cdr?.markForCheck();
            },
            error: () => {
                this.snackBar?.open('Erro ao registrar voto.', 'OK', { duration: 2500 });
            }
        });
    }

    abrirFonte(item: News, event?: Event): void {
        if (event) event.stopPropagation();
        if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    }

    copiarLink(item: News, event?: Event): void {
        if (event) event.stopPropagation();
        const url = item.url || window.location.href;
        navigator.clipboard?.writeText(url).then(() => {
            this.snackBar?.open('Link copiado para a área de transferência!', 'OK', { duration: 2500 });
        });
    }

    formatTimeAgo(dateInput?: string | Date): string {
        if (!dateInput) return '';
        const now = new Date().getTime();
        const past = new Date(dateInput).getTime();
        const diffMs = now - past;
        if (diffMs < 0 || isNaN(diffMs)) return '';

        const diffMinutes = Math.floor(diffMs / 60000);
        if (diffMinutes < 1) return 'Agora';
        if (diffMinutes < 60) return `Há ${diffMinutes} min`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `Há ${diffHours}h`;

        const diffDays = Math.floor(diffHours / 24);
        return `Há ${diffDays}d`;
    }
}
