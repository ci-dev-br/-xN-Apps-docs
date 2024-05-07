import { Injectable } from "@angular/core";
import { Marca } from "@portal/api";
import { DataServiceBase } from "src/app/components/dyn-form/i-form-options";

@Injectable()
export class MarcaService extends DataServiceBase<Marca> {
    constructor() {
        super();
    }
    public override findByText(text: string): Promise<Marca[]> {
        throw Error('Erro');
    }
}