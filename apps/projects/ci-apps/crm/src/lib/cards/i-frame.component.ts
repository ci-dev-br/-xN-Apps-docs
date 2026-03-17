import { Component, ElementRef, Input, OnInit, ViewChild, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'ci-card--iframe',
    template: `
        <div class="iframe-container">
            <!-- @if(!!safeUrl){<iframe #frameElement
                width="100%" 
                [src]="safeUrl"
                height="100%"
                frameborder="0" >
            </iframe>} -->
            <!-- <img  width="100%" height="100%" style="object-fit:content" src="http://142.0.109.159/axis-cgi/mjpg/video.cgi" /> -->
            <ng-template #emptyState>
                <div style="padding: 20px; text-align: center; color: #888;">
                    ⚠️ Nenhuma URL configurada.
                </div>
            </ng-template>
        </div>
    `,
    styles: [`
        .iframe-container {
            width: 100%;
            height: 100%;
            min-height: 400px; /* Altura mínima padrão */
            display: flex;
           //  object-fit: c;
            flex-direction: column;
        }
        iframe {
            flex: 1;
            border: none;
        }
        iframe ::ng-deep img{
            width: 100%;
            height: 100%;
        }
    `],
    standalone: true,
    imports: [
        CommonModule
    ]
})
export class IframeCard implements OnInit {
    private mode = 'incorporate'
    private sanitizer = inject(DomSanitizer);
    @Input() settings: { url: string } = { url: 'https://iihrwc03.iowa.uiowa.edu/axis-cgi/mjpg/video.cgi' };
    @ViewChild('frameElement')
    frameElement?: ElementRef<HTMLIFrameElement> | undefined;
    safeUrl: SafeResourceUrl | null = null;
    constructor(
        private readonly http: HttpClient,
    ) { }
    async ngOnInit() {
        if (this.settings && this.settings.url) {
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.settings.url);
        }
    }
    async loaded(x: Object) {
        x;
    }
}

export const IframeCardInfo = {
    title: 'Website Embed',
    descricao: `Incorporar site externo (Iframe)`,
    tags: ['Tools', 'Embed', 'Web', 'Iframe'],
    componentRef: IframeCard,
    componentVersion: '1.0.0',
    componentName: 'IframeWidget',
    // Definição dos campos que o usuário poderá editar
    settings: {
        url: 'https://tradersunion.com/pt/currencies/forecast/usd-brl/' // Valor padrão ou placeholder
    }
};