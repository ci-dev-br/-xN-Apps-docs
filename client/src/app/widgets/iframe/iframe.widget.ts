import { Component, Input, NgModule, SecurityContext } from "@angular/core";
import { IWidget } from "../i-widget";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'px-iframe-widget',
    template: `
        <div *ngIf="title" class="card-title">{{title}}</div>
        <iframe class="card-content-full" [src]="url"  >
        </iframe>
    `,
    styles: [``]
})
export class IFrameWidget {
    @Input()
    title?: string;
    private _url?: any;
    public get url() {
        return this._url;
    }
    @Input()
    public set url(value) {
        console.log(value);
        this._url = this.domSanitize.bypassSecurityTrustResourceUrl(value as string);
    }
    constructor(
        private readonly domSanitize: DomSanitizer,
    ) { }
}
@NgModule({
    declarations: [
        IFrameWidget,
    ],
    exports: [
        IFrameWidget,
    ]
})
export class IFrameWidgetModule { }
export const IFrameWidgetInfo: IWidget = {
    title: "IFrame Widget",
    description: 'Página externa a partir de uma URL.',
    tags: ['Elementos'],
    settings: {
        title: { type: 'text', maxLength: 80, label: 'Título' },
        url: { type: 'text', maxLength: 1024, label: 'Endereço URL' },
    },
    module: IFrameWidgetModule,
    component: IFrameWidget,
};