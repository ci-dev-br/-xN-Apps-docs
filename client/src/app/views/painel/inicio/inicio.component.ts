import { Component } from "@angular/core";
import { WindowService } from "src/app/components/window/window.service";
import { AdicionarWidgetComponent } from "./adicionar-widget/adicionar-widget.component";
import { UserService } from "src/app/services/user.service";
import { WidgetService } from "./widget.service";
import { Prancheta, PranchetaService } from "@portal/api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'px-inicio',
    templateUrl: 'inicio.component.html',
    styleUrls: [
        './inicio.component.scss'
    ]
})
export class InicioComponent {
    user$ = this.user_service.user;
    // widgets = this.widgetServices.widgets;
    pranchetas?: Prancheta[];
    constructor(
        private readonly window: WindowService,
        private readonly user_service: UserService,
        private readonly widgetServices: WidgetService,
    ) {
        (async () => {
            this.pranchetas = await this.widgetServices.pranchetas();
        })();
        document.oncontextmenu = (event: MouseEvent) => this.contextMenuHandler(event);
    }
    contextMenuHandler(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
    }
    editWidgetCard() {

    }
    confirmEditingWidgetCard() {

    }
    adicionarCard() {
        this.window.open(AdicionarWidgetComponent, {});
    }
    criarWidget() {

    }
    instalarWidget() {

    }
    loadWidgets(prancheta: Prancheta) {
        if (!!(prancheta as any)._widgets) return (prancheta as any)._widgets;
        if (prancheta.cards) {
            // prancheta.cards

            // (prancheta as any)._widgets = 
        } else {
            return (prancheta as any)._widgets = []
        }
    }
}