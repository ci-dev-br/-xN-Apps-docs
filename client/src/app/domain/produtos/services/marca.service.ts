import { Injectable } from "@angular/core";
import { DataServiceBase } from "src/app/components/dyn-form/i-form-options";

@Injectable()
export class MarcaService extends DataServiceBase {
    constructor() {
        super();
    }
    async find(input: string) {

    }
}