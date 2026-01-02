import { Directive, ElementRef, Input, Optional } from "@angular/core";

@Directive({
    selector: '[contextMenu]',
    standalone: false
})
export class ContextMenuDirective {
    constructor(
        @Optional()
        private readonly element?: ElementRef<HTMLElement>
    ) {
        element?.nativeElement.addEventListener('contextmenu', (event: PointerEvent) => this.handler(event));
    }
    private _options: any;
    public get options(): any {
        return this._options;
    }
    @Input('contextMenu')
    public set options(value: any) {
        this._options = value;
    }
    private handler(event: PointerEvent) {
        event.preventDefault();
    }
}