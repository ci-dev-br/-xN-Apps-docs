import { Directive, ElementRef, Input, OnInit } from "@angular/core";

@Directive({
    selector: '[t]',
    standalone: true,
})
export class TranslateDirective implements OnInit {
    private _translationCode?: string | undefined;
    public get translationCode(): string | undefined {
        return this._translationCode;
    }
    @Input('t')
    public set translationCode(value: string | undefined) {
        this._translationCode = value;
    }
    constructor(
        private readonly _el: ElementRef<any>,
    ) {
    }
    ngOnInit(): void {
        if (!this.translationCode || this.translationCode === '') {
            console.log(this._el.nativeElement?.innerText);
        }
    }
}