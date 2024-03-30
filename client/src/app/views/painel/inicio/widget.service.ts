import { Injectable } from "@angular/core";
import { Prancheta, PranchetaService as PranchetaApiService } from "@portal/api";
import { lastValueFrom } from "rxjs";
import { DaoService, SerializedObjectData } from "src/app/core/dao/dao.service";
import { IWidget } from "src/app/widgets/i-widget";
import { PranchetaService } from "../config.service";

@Injectable()
export class WidgetService {
    constructor(
        private readonly pranchetaApiService: PranchetaApiService,
        private readonly daoService: DaoService,
        private readonly prancheta: PranchetaService,

    ) {
        this.pranchetas();
    }
    async sync() {
    }
    async adicionarWidget(settings: any, widget_info: IWidget,
    ) {
        this.prancheta.addWidgetOnPrancheta(settings, widget_info);
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