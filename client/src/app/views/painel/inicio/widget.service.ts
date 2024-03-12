import { Injectable } from "@angular/core";
import { Prancheta, PranchetaService } from "@portal/api";
import { lastValueFrom } from "rxjs";
import { IWidget } from "src/app/widgets/i-widget";

@Injectable()
export class WidgetService {
    widgets: { widget: IWidget, settings: any }[] = [];
    constructor(
        private readonly pranchetaApiService: PranchetaService,

    ) {
        this.pranchetas();
    }
    async sync() {
        await lastValueFrom(
            this.pranchetaApiService.pranchetaControllerSync({
                body: {
                    // pranchta: {
                    //     // cards:
                    //     title: 'Teste'
                    // }
                }
            })
        );
    }
    async adicionarWidget(
        settings: any,
        widget: IWidget,
    ) {
        this.widgets.push({ settings, widget });
        this.sync();
    }
    async pranchetas() {
        let pranchetas: Prancheta[] = await lastValueFrom(
            this.pranchetaApiService.pranchetaControllerGet({ body: {} })
        )
        return pranchetas;
    }
}