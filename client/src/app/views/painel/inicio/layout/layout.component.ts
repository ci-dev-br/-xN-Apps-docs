import { Component } from "@angular/core";
import { Prancheta } from "@portal/api";
import { PranchetaService } from "../../config.service";

@Component({
    selector: 'px-layout',
    templateUrl: 'layout.component.html',
    styleUrls: ['layout.component.scss']
})
export class LayoutComponent {
    prancheta?: Prancheta;
    layouts = [
        '1-3-1',
        '2-2-2',
        '1-1-1',
        '4-1-2-2',
    ];
    // layoutSelecionado?: string;
    get title(): string {
        return this.prancheta?.title || '';
    }
    set title(value: string) {
        if (this.prancheta) this.prancheta.title = value;
    }
    get layout(): string {
        return this.prancheta?.layout || '';
    }
    set layout(value: string) {
        if (this.prancheta) this.prancheta.layout = value;
    }
    constructor(
        private readonly prachetaService: PranchetaService,
    ) {
        prachetaService.pranchetaAtual$.subscribe(v => {
            this.prancheta = v;
        });
    }
}