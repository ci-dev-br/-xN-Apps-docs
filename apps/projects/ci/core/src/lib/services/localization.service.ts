import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { Localizacao } from "../model/localozacao";

@Injectable()
export class LocalizationService {
    private inicializada?: boolean;
    private localizationTrack = new ReplaySubject(150);
    constructor(
    ) { }
    async init() {
        this.inicializada = true;
        if ("geolocation" in navigator) {
            this.getLocalization();
            this.track();
        } else {
        }
    }
    private getLocalization() {
        this.watchID = navigator.geolocation.watchPosition((position) => {
            this.localizationTrack.next(new Localizacao({
                latitude: position.coords.latitude, longitude: position.coords.longitude
            }))
        });
    }
    sleep = 10000;
    private track() {
        this.getLocalization();
        setTimeout(() => { this.track() }, this.sleep || 60000);
    }
    anything: any[] = [];
    set watchID(value: any) {
        this.anything.push(value);
    }
    get tracking() { return this.localizationTrack; }
}