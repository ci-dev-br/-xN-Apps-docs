import { ChangeDetectionStrategy, Component, HostListener, Inject, InjectionToken, Input, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { News } from '@ci/portal-api';

export interface NewsTooltipData {
    news: Partial<News>;
    onPointerEnter?: () => void;
    onPointerLeave?: () => void;
}

export const NEWS_TOOLTIP_DATA = new InjectionToken<NewsTooltipData>('NEWS_TOOLTIP_DATA');

@Component({
    selector: 'ci-news-quick-read-tooltip',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './news-quick-read-tooltip.component.html',
    styleUrls: ['./news-quick-read-tooltip.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsQuickReadTooltipComponent {
    @Input() news?: Partial<News> | null;

    constructor(
        @Optional() @Inject(NEWS_TOOLTIP_DATA) private readonly data?: NewsTooltipData,
    ) {
        if (this.data?.news) {
            this.news = this.data.news;
        }
    }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        this.data?.onPointerEnter?.();
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        this.data?.onPointerLeave?.();
    }

    get titleText(): string {
        return this.cleanText(this.news?.title) || 'Notícia sem título';
    }

    get contentText(): string {
        const raw = this.cleanText(this.news?.content);
        if (!raw) {
            return 'Passe o cursor e clique para abrir os detalhes completos desta notícia.';
        }
        const maxLength = 420;
        if (raw.length <= maxLength) {
            return raw;
        }
        const sliced = raw.slice(0, maxLength);
        const lastSpace = sliced.lastIndexOf(' ');
        return (lastSpace > 240 ? sliced.slice(0, lastSpace) : sliced).trim() + '...';
    }

    get categoryLabel(): string {
        return this.news?.categoria || this.news?.category?.name || 'Mercado';
    }

    get sourceLabel(): string {
        return (
            this.news?.sourceInfo?.name ||
            this.news?.sourceName ||
            this.news?.sourceInfo?.domain ||
            this.extractHost(this.news?.url) ||
            'Noticiário'
        );
    }

    get dateLabel(): string {
        const dateInput = this.news?.scrapedAt || this.news?.modifiedAt;
        if (!dateInput) return '';
        const parsed = new Date(dateInput);
        if (Number.isNaN(parsed.getTime())) return '';

        const diffMs = Date.now() - parsed.getTime();
        if (diffMs >= 0) {
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 1) return 'Agora';
            if (diffMin < 60) return `Há ${diffMin} min`;
            const diffHours = Math.floor(diffMin / 60);
            if (diffHours < 24) return `Há ${diffHours}h`;
        }

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(parsed);
    }

    private extractHost(url?: string): string {
        if (!url) return '';
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch {
            return '';
        }
    }

    private cleanText(value?: string | null): string {
        if (!value) return '';
        const withoutTags = String(value)
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
            .replace(/<[^>]+>/g, ' ');

        return this.decodeHtmlEntities(withoutTags)
            .replace(/\s+/g, ' ')
            .trim();
    }

    private decodeHtmlEntities(text: string): string {
        if (typeof DOMParser !== 'undefined') {
            try {
                const doc = new DOMParser().parseFromString(text, 'text/html');
                return doc.documentElement.textContent || text;
            } catch {
                // fallback abaixo
            }
        }
        return text
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;|&apos;/gi, "'")
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>');
    }
}
