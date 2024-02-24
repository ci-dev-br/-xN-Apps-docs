import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class InfraService {
    private _domains = new BehaviorSubject(null);
    private _servidores = new BehaviorSubject(null);
    private _paineis = new BehaviorSubject(null);

    get domains() { return this._domains; }
    get servidores() { return this._servidores; }
    get paineis() { return this._paineis; }

    constructor(

    ) { }
    adicionarDominio() { }
    adicionarServidor() { }
    adicionarPainel() { }
}