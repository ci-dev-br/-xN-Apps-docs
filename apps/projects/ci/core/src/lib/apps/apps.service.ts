import { Injectable } from "@angular/core";

export interface IInention {
    fileFormat?: string;
    encoding?: string;
    fileName?: string;
}

@Injectable()
export class Apps {
    constructor() { }
    async RequireOpen(intention: IInention) { }
}