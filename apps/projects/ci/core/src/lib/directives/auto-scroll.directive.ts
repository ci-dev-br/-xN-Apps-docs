import { ComponentRef, Directive, ElementRef, Input, Optional } from "@angular/core";
@Directive({
    selector: '[auto-scroll]'
})
export class AutoScollDirective {
    private _autoScroll?: string | undefined;
    public get autoScroll(): string | undefined {
        return this._autoScroll;
    }
    @Input('auto-scroll')
    public set autoScroll(value: string | undefined) {
        if (this._autoScroll === value) return;
        this._autoScroll = value;
    }


    constructor(
        @Optional() private readonly element: ElementRef<HTMLElement>,
    ) {
        this.element.nativeElement.onmousemove = (event: MouseEvent) => this.mouseMoveHandler(event);
        this.element.nativeElement.style.overflowX = 'hidden';
    }

    private mouseMoveHandler(event: MouseEvent) {
        if (this._autoScroll === 'horizontal') {
            let pos = 0;

            this.element.nativeElement.scrollLeft = pos;//event.clientX - this.element.nativeElement.getBoundingClientRect().left;
        } else if (this._autoScroll === 'vertical') {
            const element: HTMLElement | null = (this.element.nativeElement.querySelector('.mat-drawer-inner-container')) || null;
            if (!element) return;
            let rolamento_maximo = element.scrollHeight - element.getBoundingClientRect().height;
            element.scrollTop = (event.y - element.getBoundingClientRect().top) / element.getBoundingClientRect().height * rolamento_maximo;
            /// console.log((event.y + element.getBoundingClientRect().top) / element.getBoundingClientRect().height)
        }
    }
}