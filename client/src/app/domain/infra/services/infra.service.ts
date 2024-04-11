import { Injectable } from "@angular/core";
import { Domain, DomainService } from "@portal/api";
import { BehaviorSubject } from "rxjs";
import { WindowService } from "src/app/components/window/window.service";
import { DaoService } from "src/app/core/dao/dao.service";
import { DomainComponent } from "../inicio/casdastros/domain/domain.component";

@Injectable()
export class InfraService {
    private _domains = new BehaviorSubject(null);
    private _servidores = new BehaviorSubject(null);
    private _paineis = new BehaviorSubject(null);

    get domains() { return this._domains; }
    get servidores() { return this._servidores; }
    get paineis() { return this._paineis; }

    constructor(
        public readonly window: WindowService,
        public readonly dao: DaoService,
        public readonly domainService: DomainService,

    ) { }
    adicionarDominio() {
        this.window.open(DomainComponent, this.dao.prepareToEdit({} as Domain));
    }
    adicionarServidor() { }
    adicionarPainel() { }
}