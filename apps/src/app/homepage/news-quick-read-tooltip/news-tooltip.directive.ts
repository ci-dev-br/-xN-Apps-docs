import {
    Directive,
    ElementRef,
    HostListener,
    Inject,
    Injector,
    Input,
    OnDestroy,
    PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { News } from '@ci/portal-api';
import {
    NEWS_TOOLTIP_DATA,
    NewsQuickReadTooltipComponent,
    NewsTooltipData,
} from './news-quick-read-tooltip.component';

const TOOLTIP_POSITIONS: ConnectedPosition[] = [
    {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 8,
    },
    {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -8,
    },
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 8,
    },
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetY: 8,
    },
];

@Directive({
    selector: '[ciNewsTooltip]',
    standalone: true,
})
export class NewsTooltipDirective implements OnDestroy {
    @Input('ciNewsTooltip') news?: Partial<News> | null;
    @Input() ciNewsTooltipDisabled = false;

    private overlayRef?: OverlayRef;
    private openTimer?: ReturnType<typeof setTimeout>;
    private closeTimer?: ReturnType<typeof setTimeout>;
    private isPointerInsideOverlay = false;

    constructor(
        private readonly overlay: Overlay,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly injector: Injector,
        @Inject(PLATFORM_ID) private readonly platformId: object,
    ) { }

    @HostListener('mouseenter')
    @HostListener('focusin')
    onMouseEnter(): void {
        if (!this.canShow()) return;
        this.clearCloseTimer();
        if (this.overlayRef?.hasAttached()) return;

        this.clearOpenTimer();
        this.openTimer = setTimeout(() => {
            this.show();
        }, 180);
    }

    @HostListener('mouseleave')
    @HostListener('focusout')
    onMouseLeave(): void {
        this.clearOpenTimer();
        this.scheduleClose();
    }

    @HostListener('click')
    onClick(): void {
        this.hideImmediately();
    }

    ngOnDestroy(): void {
        this.hideImmediately();
        this.overlayRef?.dispose();
        this.overlayRef = undefined;
    }

    private canShow(): boolean {
        if (!isPlatformBrowser(this.platformId)) return false;
        if (this.ciNewsTooltipDisabled || !this.news) return false;
        return !!(this.news.title || this.news.content);
    }

    private show(): void {
        if (!this.canShow()) return;

        if (!this.overlayRef) {
            const positionStrategy = this.overlay
                .position()
                .flexibleConnectedTo(this.elementRef)
                .withPositions(TOOLTIP_POSITIONS)
                .withViewportMargin(12)
                .withPush(true);

            this.overlayRef = this.overlay.create({
                positionStrategy,
                scrollStrategy: this.overlay.scrollStrategies.reposition(),
                hasBackdrop: false,
            });
        } else {
            this.overlayRef.updatePosition();
        }

        if (this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }

        const tooltipData: NewsTooltipData = {
            news: this.news!,
            onPointerEnter: () => {
                this.isPointerInsideOverlay = true;
                this.clearCloseTimer();
            },
            onPointerLeave: () => {
                this.isPointerInsideOverlay = false;
                this.scheduleClose();
            },
        };

        const customInjector = Injector.create({
            parent: this.injector,
            providers: [{ provide: NEWS_TOOLTIP_DATA, useValue: tooltipData }],
        });

        const portal = new ComponentPortal(NewsQuickReadTooltipComponent, null, customInjector);
        this.overlayRef.attach(portal);
    }

    private scheduleClose(): void {
        this.clearCloseTimer();
        this.closeTimer = setTimeout(() => {
            if (!this.isPointerInsideOverlay) {
                this.detach();
            }
        }, 120);
    }

    private hideImmediately(): void {
        this.clearOpenTimer();
        this.clearCloseTimer();
        this.isPointerInsideOverlay = false;
        this.detach();
    }

    private detach(): void {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }
    }

    private clearOpenTimer(): void {
        if (this.openTimer) {
            clearTimeout(this.openTimer);
            this.openTimer = undefined;
        }
    }

    private clearCloseTimer(): void {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = undefined;
        }
    }
}
