import { ComponentRef, Directive, ElementRef, Input, OnInit, Optional, ViewContainerRef, ViewRef } from "@angular/core";
import { StageService } from "../stage/stage.service";

@Directive({
    selector: '[stage]',
    standalone: false,
})
export class StageDirective implements OnInit {
    private _stage?: string | undefined;
    public get stage(): string | undefined {
        return this._stage;
    }
    @Input()
    public set stage(value: string | undefined) {
        if (this._stage === value) return;
        this._stage = value;

        if (this.stages?.host) (async () => {
            try {
                if (this.stages?.host && 'stage' in this.stages.host && this.stages.host.stage === this._stage) {

                }
            } catch (error) { }
        })();
    }
    constructor(
        @Optional() private readonly stages?: StageService,
    ) {
    }
    ngOnInit(): void {

    }
}