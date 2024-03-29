import { Component } from "@angular/core";
import { WindowService } from "src/app/components/window/window.service";
import { AdicionarWidgetComponent } from "./adicionar-widget/adicionar-widget.component";
import { UserService } from "src/app/services/user.service";
import { WidgetService } from "./widget.service";
import { Prancheta } from "@portal/api";
import { PranchetaService } from "../config.service";

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
    private _tabIndex?: number | undefined;
    get tabIndex(): number | undefined {
        return this._tabIndex;
    }
    set tabIndex(value: number | undefined) {
        if (this._tabIndex === value) return;
        this._tabIndex = value;
        if (this.pranchetas && value !== undefined && this.pranchetas[value])
            this.pranchetaService.currentPrancheta = this.pranchetas[value];
    }
    constructor(
        private readonly window: WindowService,
        private readonly user_service: UserService,
        private readonly widgetServices: WidgetService,
        private readonly pranchetaService: PranchetaService,
    ) {
        (async () => {
            this.pranchetas = (await this.widgetServices.pranchetas())
                .sort((pa, pb) => (pa.order || 0) > (pb.order || 0) ? 1 : (pa.order || 0) < (pb.order || 0) ? -1 : 0);
            this.tabIndex = 0;
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
        return this.pranchetaService.loadWidgets(prancheta);
    }
}