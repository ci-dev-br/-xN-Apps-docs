import { HttpClient } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDividerModule } from "@angular/material/divider";
import { DatePipe } from "@angular/common";
import { CoreModule } from "@ci/core"; // Mantenha se for parte do seu core
import { XMLParser } from 'fast-xml-parser';
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-card--rss-card',
    template: `
    <mat-card class="rss-card-container">
        <mat-card-header>
            <mat-card-title>
                @if (stage === 'config') {
                    Configure o serviço de RSS
                } @else {
                    {{ getChannelTitle() || 'Feed RSS' }}
                }
            </mat-card-title>
            <mat-card-subtitle>
                @if (stage === 'config') {
                    Insira o endereço do RSS abaixo:
                } @else {
                    {{ getChannelDescription() }}
                }
            </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
            @if(stage === 'config') {
                <div class="config-stage">
                    <mat-form-field class="full-width">
                        <mat-label>URL do Feed RSS</mat-label>
                        <input matInput placeholder="https://..." [(ngModel)]="url" (keydown.enter)="update()" />
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="configurar()" [disabled]="!url">
                        Configurar
                    </button>
                </div>
            } @else {
                <div class="run-stage">
                    <div class="actions-row">
                        <button mat-stroked-button (click)="stage = 'config'">
                            ⚙️ Alterar URL
                        </button>
                    </div>

                    <div class="feed-items-list">
                        @for (item of getItems(); track item.link || item.guid || $index) {
                            <div class="feed-item">
                                <h3 class="item-title">
                                    <a [href]="item.link" target="_blank">{{ item.title }}</a>
                                </h3>
                                
                                @if (item.pubDate) {
                                    <small class="item-date">{{ item.pubDate | date:'dd/MM/yyyy HH:mm' }}</small>
                                }

                                <div class="item-description" [innerHTML]="cleanDescription(item.description)"></div>
                            </div>
                            <mat-divider></mat-divider>
                        } @empty {
                            <p class="empty-message">Nenhum item encontrado neste feed ou formato não suportado.</p>
                        }
                    </div>
                </div>
            }
        </mat-card-content>
    </mat-card>
    `,
    styles: [`
        .rss-card-container {
            max-width: 600px;
            margin: 16px auto;
        }
        .full-width {
            width: 100%;
        }
        .config-stage {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 16px;
        }
        .actions-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 16px;
        }
        .feed-items-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-height: 500px;
            overflow-y: auto;
            padding-right: 8px;
        }
        .feed-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .item-title {
            margin: 0;
            font-size: 1.1rem;
        }
        .item-title a {
            text-decoration: none;
            color: #3f51b5; /* Cor primária do Material ou adapte ao seu tema */
        }
        .item-title a:hover {
            text-decoration: underline;
        }
        .item-date {
            color: #666;
            font-size: 0.8rem;
        }
        .item-description {
            font-size: 0.9rem;
            color: #444;
            display: -webkit-box;
            -webkit-line-clamp: 3; /* Limita a 3 linhas para não estourar o card */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .empty-message {
            text-align: center;
            color: #888;
            padding: 24px 0;
        }
    `],
    standalone: true,
    imports: [
        CoreModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatDividerModule,
        DatePipe
    ]
})
export class RSSCard implements OnInit {
    stage: 'config' | 'run' = 'config';
    data?: any;
    @Input() url?: string;

    constructor(private readonly http: HttpClient) { }

    ngOnInit(): void {
        if (this.url) {
            this.loadRSS();
        }
    }

    async update() {
        if (this.url && this.url.trim().length > 0) {
            await this.loadRSS();
            if (this.data) {
                this.stage = 'run';
            }
        }
    }

    async loadRSS() {
        try {
            if (!this.url) return;
            const xml_parser = new XMLParser({
                ignoreAttributes: false,
                cdataPropName: "__cdata" // Lida com CDATA tags onde descrições HTML costumam ficar
            });

            const xmlData = await lastValueFrom(
                this.http.get(this.url, { responseType: 'text' })
            );

            this.data = xml_parser.parse(xmlData);
        } catch (error) {
            console.error('Erro ao carregar RSS:', error);
            // Opcional: Adicionar um Toast/Snackbar de erro aqui
        }
    }

    configurar() {
        this.update();
    }

    // --- Métodos Auxiliares para lidar com a estrutura JSON gerada do XML ---

    getChannelTitle(): string {
        // Tenta buscar no padrão RSS 2.0 e fallback para Atom
        return this.data?.rss?.channel?.title || this.data?.feed?.title || '';
    }

    getChannelDescription(): string {
        return this.data?.rss?.channel?.description || this.data?.feed?.subtitle || '';
    }

    getItems(): any[] {
        const items = this.data?.rss?.channel?.item || this.data?.feed?.entry;
        if (!items) return [];
        // O fast-xml-parser retorna um objeto em vez de array se houver apenas 1 item no feed.
        return Array.isArray(items) ? items : [items];
    }

    cleanDescription(desc: any): string {
        if (!desc) return '';
        // Se a descrição veio em tag CDATA, o parser pode colocar em uma propriedade específica
        const text = typeof desc === 'object' && desc.__cdata ? desc.__cdata : desc;
        return typeof text === 'string' ? text : '';
    }
}

export const RSSCardInfo = {
    title: 'RSS',
    descricao: `RSS Card, visualização de conteúdo em feed RSS a partir de xml.`,
    tags: ['Blogs'],
    componentRef: RSSCard,
    componentVersion: '1.0.0',
    componentName: 'RSSCard',
    settings: {
        url: { label: 'Url' }
    }
};