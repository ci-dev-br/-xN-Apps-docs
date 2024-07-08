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
        this.element.nativeElement.onmousemove = (event: MouseEvent) => {
            if (this._autoScroll === 'horizontal') {
                let pos = 0;

                this.element.nativeElement.scrollLeft = pos;//event.clientX - this.element.nativeElement.getBoundingClientRect().left;
            }
        }
        this.element.nativeElement.style.overflowX = 'hidden';
    }
}