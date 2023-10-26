import { Directive, HostListener } from "@angular/core";
@Directive({
    selector: 'router-outlet'
})
export class ContextmenuDirective {
    waiting?: boolean;
    constructor() {
    }
    @HostListener('window:contextmenu', ['$event'])
    contextmenuHandler(event: PointerEvent) {
        if (this.waiting) return;
        event.preventDefault();
        this.waiting = true;
        setTimeout(() => this.waiting = undefined, 750);
    }
}