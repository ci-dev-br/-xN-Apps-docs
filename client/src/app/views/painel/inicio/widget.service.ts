import { Injectable } from "@angular/core";
import { Prancheta, PranchetaService as PranchetaApiService } from "@portal/api";
import { lastValueFrom } from "rxjs";
import { DaoService, SerializedObjectData } from "src/app/core/dao/dao.service";
import { IWidget } from "src/app/widgets/i-widget";

@Injectable()
export class WidgetService {
    widgets: { widget: IWidget, settings: any }[] = [];
    constructor(
        private readonly pranchetaApiService: PranchetaApiService,
        private readonly daoService: DaoService,

    ) {
        this.pranchetas();
    }
    async sync() {

        // await lastValueFrom(
        //     this.pranchetaApiService.pranchetaControllerSync({
        //         body: {
        //             // pranchta: {
        //             //     // cards:
        //             //     title: 'Teste'
        //             // }
        //         }
        //     })
        // );
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
        this.daoService.prepareToEdit(pranchetas, {
            onChange: async (changes) => {
                pranchetas.filter(p => this.daoService.haveChanges(p)).forEach(async prancheta => {
                    await lastValueFrom(this.pranchetaApiService.pranchetaControllerSync({
                        body: { prancheta },
                    }));
                    if (prancheta instanceof SerializedObjectData) prancheta.complete();
                })
            },
            debounceTime: 1000,
        });
        return pranchetas;
    }
}