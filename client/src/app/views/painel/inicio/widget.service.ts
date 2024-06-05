import { EventEmitter, Injectable } from "@angular/core";
import { Prancheta, PranchetaService as PranchetaApiService } from "@portal/api";
import { lastValueFrom } from "rxjs";
import { DaoService, SerializedObjectData } from "src/app/core/dao/dao.service";
import { IWidget } from "src/app/widgets/i-widget";
import { PranchetaService } from "../config.service";
import { StringOrNumberOrDate } from "@swimlane/ngx-charts";

@Injectable()
export class WidgetService {
    private _$update = new EventEmitter<void>();
    get $update() { return this._$update; }
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
        this._$update.emit();
    }
    async pranchetas() {
        let pranchetas: Prancheta[] = await lastValueFrom(
            this.pranchetaApiService.pranchetaControllerGet({ body: {} })
        ) || [];
        this.daoService.prepareToEdit(pranchetas, {
            onChange: async (changes) => {
                pranchetas.filter(p => this.daoService.haveChanges(p)).forEach(async prancheta => {
                    await lastValueFrom(this.pranchetaApiService.pranchetaControllerSync({
                        body: { prancheta },
                    }));
                    if (prancheta instanceof SerializedObjectData) prancheta.complete();
                })
            },
            debounceTime: 350,
        });
        return pranchetas;
    }
    async adicionarPrancheta(prancheta: { title: string, structure: string }) {
        let _prancheta = await lastValueFrom(this.pranchetaApiService.pranchetaControllerSync({
            body: {
                prancheta: {
                    title: prancheta.title,
                    layout: prancheta.structure
                }
            }
        }));
        this.daoService.prepareToEdit(_prancheta, {
            onChange: async (changes) => {
                console.log(changes)
                // _prancheta.filter(p => this.daoService.haveChanges(p)).forEach(async prancheta => {
                //     await lastValueFrom(this.pranchetaApiService.pranchetaControllerSync({
                //         body: { prancheta },
                //     }));
                //     if (prancheta instanceof SerializedObjectData) prancheta.complete();
                // })
            },
            debounceTime: 350,
        });
        return _prancheta;
    }
}