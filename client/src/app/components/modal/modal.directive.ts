import { ComponentRef, Directive, ElementRef, Input, TemplateRef } from "@angular/core";

@Directive({
    selector: '[modal]'
})
export class ModalDirective {
    @Input()
    modal?: ElementRef<any> | ComponentRef<any> | TemplateRef<any>
}