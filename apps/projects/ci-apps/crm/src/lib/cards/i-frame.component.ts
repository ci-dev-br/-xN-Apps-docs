import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
    selector: 'ci-card--iframe',
    template: `
        <div class="iframe-container">
            <iframe 
                *ngIf="safeUrl; else emptyState"
                [src]="safeUrl" 
                title="External Content"
                width="100%" 
                height="100%"
                frameborder="0"
                allowfullscreen>
            </iframe>
            
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
            flex-direction: column;
        }
        iframe {
            flex: 1;
            border: none;
        }
    `],
    standalone: true,
    imports: [
        CommonModule
    ]
})
export class IframeCard implements OnInit {
    // Injetamos o sanitizador para permitir URLs externas
    private sanitizer = inject(DomSanitizer);

    // Recebe as configurações vindas do Dashboard
    @Input() settings: { url: string } = { url: 'https://tradersunion.com/pt/currencies/forecast/usd-brl/' };

    safeUrl: SafeResourceUrl | null = null;

    ngOnInit() {
        if (this.settings && this.settings.url) {
            // Marca a URL como segura para o Angular não bloqueá-la
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.settings.url);
        }
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