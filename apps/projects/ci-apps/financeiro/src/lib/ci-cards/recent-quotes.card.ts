import { HttpClient } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { CoreModule } from "@ci/core";
import { lastValueFrom } from "rxjs";
import { CurrencyPipe, DatePipe, NgClass, DecimalPipe } from "@angular/common";

interface QuoteResponse {
    date: string;
    close: number;
    variation: number; // Percentual em relação ao dia anterior
}

@Component({
    selector: 'ci-card--recent-quotes',
    template: `
    <mat-card class="invest-card">
        <mat-card-header>
            <mat-card-title>
                @if(stage === 'config'){ Cotações Recentes }
                @else{ Tendência - {{ ticker | uppercase }} }
            </mat-card-title>
            <mat-card-subtitle>
                @if(stage === 'config'){ Informe o ticker da B3 }
                @else{ Últimos 5 pregões }
            </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
            @if(stage === 'config'){
                <div class="config-row">
                    <mat-form-field class="full-width">
                        <mat-label>Ticker</mat-label>
                        <input matInput [(ngModel)]="ticker" (keydown.enter)="update()" />
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="update()" [disabled]="!ticker">
                        Buscar Histórico
                    </button>
                </div>
            }@else{
                <div class="quotes-list">
                    @for (quote of quotes; track quote.date) {
                        <div class="quote-item">
                            <div class="quote-date">{{ quote.date | date:'dd/MM' }}</div>
                            <div class="quote-price">
                                <strong>{{ quote.close | currency:'BRL' }}</strong>
                            </div>
                            <div class="quote-var" [ngClass]="{'positive': quote.variation > 0, 'negative': quote.variation < 0, 'neutral': quote.variation === 0}">
                                @if (quote.variation > 0) { <mat-icon class="var-icon">trending_up</mat-icon> }
                                @if (quote.variation < 0) { <mat-icon class="var-icon">trending_down</mat-icon> }
                                @if (quote.variation === 0) { <mat-icon class="var-icon">trending_flat</mat-icon> }
                                <span>{{ quote.variation > 0 ? '+' : '' }}{{ quote.variation | number:'1.2-2' }}%</span>
                            </div>
                        </div>
                    } @empty {
                        <p class="empty">Nenhuma cotação recente encontrada.</p>
                    }
                    <button mat-stroked-button class="full-width mt-16" (click)="stage = 'config'">Mudar Ativo</button>
                </div>
            }
        </mat-card-content>
    </mat-card>
    `,
    styles: [`
        .invest-card { max-width: 400px; margin: 16px auto; }
        .full-width { width: 100%; }
        .mt-16 { margin-top: 16px; }
        .config-row { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .quotes-list { display: flex; flex-direction: column; margin-top: 12px; }
        .quote-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .quote-item:last-child { border-bottom: none; }
        .quote-date { color: #666; font-size: 0.9rem; width: 60px; }
        .quote-price { flex-grow: 1; text-align: center; font-size: 1.1rem; }
        .quote-var { display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 0.9rem; width: 80px; justify-content: flex-end;}
        .var-icon { font-size: 18px; width: 18px; height: 18px; }
        .positive { color: #2e7d32; }
        .negative { color: #c62828; }
        .neutral { color: #757575; }
        .empty { text-align: center; color: #888; padding: 16px 0; }
    `],
    standalone: true,
    imports: [CoreModule, MatFormFieldModule, MatInputModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe, DatePipe, DecimalPipe, NgClass]
})
export class RecentQuotesCard implements OnInit {
    stage: 'config' | 'run' = 'config';
    quotes: QuoteResponse[] = [];
    @Input() ticker?: string;

    // URL do endpoint que criaremos no NestJS (veja abaixo)
    private readonly API_URL = 'http://localhost:3000/api/quotes';

    constructor(private readonly http: HttpClient) { }

    ngOnInit(): void {
        if (this.ticker) this.update();
    }

    async update() {
        if (this.ticker) {
            try {
                this.quotes = await lastValueFrom(
                    this.http.get<QuoteResponse[]>(`${this.API_URL}/${this.ticker.toUpperCase()}/recent`)
                );
                this.stage = 'run';
            } catch (error) {
                alert('Erro ao buscar histórico de cotações.');
            }
        }
    }
}

export const RecentQuotesCardInfo = {
    title: 'Cotações Recentes',
    descricao: `Exibe os últimos 5 pregões de um ativo da B3.`,
    tags: ['B3', 'Mercado', 'Cotações'],
    componentRef: RecentQuotesCard,
    componentVersion: '1.0.0',
    componentName: 'RecentQuotesCard',
    settings: { ticker: { label: 'Ticker' } }
};