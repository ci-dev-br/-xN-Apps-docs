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
        this._autoScroll = value;

        if (this.element.nativeElement) {
            this.element.nativeElement.onmousemove = (event: MouseEvent) => {
                if (this._autoScroll === 'horizontal')
                    this.element.nativeElement.scrollLeft = event.clientX;
            }
        }
    }

    constructor(
        @Optional() private readonly element: ElementRef<HTMLElement>,
        // @Optional() private readonly component: ComponentRef<any>,
    ) {
        // component = component;
        // element = element;
    }
}