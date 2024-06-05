import { Component, EventEmitter } from "@angular/core";
import { WindowService } from "src/app/components/window/window.service";
import { AdicionarWidgetComponent } from "./adicionar-widget/adicionar-widget.component";
import { UserService } from "src/app/services/user.service";
import { WidgetService } from "./widget.service";
import { Prancheta } from "@portal/api";
import { IWidgetLoadedData, PranchetaService } from "../config.service";
import { FormBuilder, Validators } from "@angular/forms";

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
        private readonly fb: FormBuilder,
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
    contextmenuHandler(event: PointerEvent | MouseEvent, widget: IWidgetLoadedData) {
        event.preventDefault();
        if (widget._onConfig) this.updateCards();
        widget._onConfig = !widget._onConfig;
    }
    // removeWidget(widget: IWidgetLoadedData) {
    //     if (!this.pranchetaService.currentWidgets) return;
    //     const pos = this.pranchetaService.currentWidgets.indexOf(widget);
    //     if (pos > -1)
    //         this.pranchetaService.currentWidgets.splice(pos, 1);
    //     this.updateCards();
    // }
    updateCards() {
        this.pranchetaService.updateCards();
    }

    getTemplate(structure: string) {
        let cnt = 0;
        return structure.split('-').map(v => Array(Number(v)).fill('').map(c => 'w' + cnt++)).map(a => a.join(' ')).map(l => `"${l}"`).join('\n');
    }
    adicionarPranchetaForm = this.fb.group({
        title: [, [Validators.required]],
        structure: [, [Validators.required]],
    });
    async adicionarPrancheta() {
        if (this.adicionarPranchetaForm.invalid) {
            this.adicionarPranchetaForm.markAllAsTouched();
            return;
        }
        let a = this.adicionarPranchetaForm.getRawValue();
        this.adicionarPranchetaForm.reset();
        let prancheta = await this.widgetServices.adicionarPrancheta({
            title: a.title || '',
            structure: a.structure || ''
        })

        if (!this.pranchetas) this.pranchetas = []
        this.pranchetas.push(prancheta);
    }
}