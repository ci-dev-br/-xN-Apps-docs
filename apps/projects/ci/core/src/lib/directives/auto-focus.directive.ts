import { Directive, ElementRef, OnInit } from "@angular/core";

@Directive({
    selector: 'input[focused]'
})
export class AutoFocusDirective implements OnInit {
    constructor(
        private readonly el: ElementRef<HTMLInputElement>
    ) {
    }
    async ngOnInit() {
        setTimeout(() => this.el.nativeElement.focus(), 0);
    }
}