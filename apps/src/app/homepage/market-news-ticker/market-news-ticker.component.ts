import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { News, NewsService } from '@ci/portal-api';

@Component({
    selector: 'ci-market-news-ticker',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    templateUrl: './market-news-ticker.component.html',
    styleUrls: ['./market-news-ticker.component.scss']
})
export class MarketNewsTickerComponent implements OnInit, OnDestroy {
    @ViewChild('tickerTrack') tickerTrack?: ElementRef<HTMLDivElement>;
    @Output() newsSelected = new EventEmitter<News>();

    items: News[] = [];
    isLoading = true;
    isPaused = false;
    private refreshTimer?: any;

    constructor(
        @Optional() private readonly newsService?: NewsService,
        private readonly cdr?: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadMarketNews();
        // Atualiza notícias a cada 3 minutos
        this.refreshTimer = setInterval(() => {
            this.loadMarketNews(false);
        }, 180000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }

    loadMarketNews(showLoading = true): void {
        if (!this.newsService) return;
        if (showLoading) {
            this.isLoading = true;
            this.cdr?.markForCheck();
        }

        this.newsService.getMarketNews({ limit: 20 }).subscribe({
            next: (data) => {
                if (data && Array.isArray(data)) {
                    this.items = data.filter(item => !!item && !!item.title);
                }
                this.isLoading = false;
                this.cdr?.markForCheck();
            },
            error: (err) => {
                console.warn('Falha ao carregar notícias de mercado para o ticker:', err);
                this.isLoading = false;
                this.cdr?.markForCheck();
            }
        });
    }

    onItemClick(item: News): void {
        this.newsSelected.emit(item);
    }

    scrollLeft(): void {
        if (this.tickerTrack?.nativeElement) {
            this.tickerTrack.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
        }
    }

    scrollRight(): void {
        if (this.tickerTrack?.nativeElement) {
            this.tickerTrack.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
        }
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
