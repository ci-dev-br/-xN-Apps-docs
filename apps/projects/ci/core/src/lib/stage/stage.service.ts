import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class StageService {
    $stage: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    constructor() { }
    private _host: any;
    public get host(): any {
        return this._host;
    }
    public set host(value: any) {
        if (this._host === value) return;
        this._host = value;
        if ('stageOutput' in value && value.stageOutput instanceof EventEmitter)
            (value.stageOutput as EventEmitter<any>).subscribe(() => this.update());
    }
    update() {
        this.$stage.next(this.host.stage)
    }
}