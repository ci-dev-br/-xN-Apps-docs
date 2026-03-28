import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Directive, ElementRef, Input, Optional, ViewContainerRef } from "@angular/core";
import { ContextMenuComponent } from "./context-menu.component";
import { IContextMenu } from "./i-contex-menu";

@Directive({
    selector: '[contextMenu]',
    standalone: false
})
export class ContextMenuDirective {
    private overlayRef: OverlayRef | null = null;
    constructor(
        @Optional()
        private readonly overlay: Overlay,
        @Optional()
        private readonly viewContainerRef: ViewContainerRef,
        @Optional()
        private readonly element?: ElementRef<HTMLElement>,
    ) {
        element?.nativeElement.addEventListener('contextmenu', (event: PointerEvent) => this.handler(event));
    }
    private _options?: IContextMenu[];
    public get options() {
        return this._options;
    }
    @Input('contextMenu')
    public set options(value) {
        this._options = value;
    }
    private handler(event: PointerEvent) {
        event.preventDefault();
        this.openContextMenu(event);
    }
    private openContextMenu(event: MouseEvent) {
        this.close();
        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
            .withPositions([
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
            ]);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop'
        });
        const portal = new ComponentPortal(ContextMenuComponent);
        const componentRef = this.overlayRef.attach(portal);
        this.overlayRef.backdropClick().subscribe(() => this.close());
        componentRef.instance.items = this.options;
        componentRef.instance.action.subscribe(() => this.close());
    }
    private close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
}