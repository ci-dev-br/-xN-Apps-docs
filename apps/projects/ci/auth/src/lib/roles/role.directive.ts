import { Directive, ElementRef, Input, Optional } from "@angular/core";

@Directive({
    selector: '[role]',
    standalone: false,
})
export class RoleDirective {
    @Input() role?: string;

    constructor(
        @Optional() private el?: ElementRef,
    ) {

    }
}