import { Injectable } from "@angular/core";
import { Prancheta } from "@portal/api";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class PranchetaService {
    constructor() { }

    private $pranchetaAtual = new BehaviorSubject<Prancheta | undefined>(undefined);
    get pranchetaAtual$() {
        return this.$pranchetaAtual;
    }
    get pranchetaAtual() {
        return this.$pranchetaAtual.getValue();
    }
    set pranchetaAtual(value: Prancheta | undefined) {
        this.$pranchetaAtual.next(value);
    }
}