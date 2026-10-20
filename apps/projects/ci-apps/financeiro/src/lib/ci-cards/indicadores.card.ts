import { HttpClient } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CoreModule } from "@ci/core";
import { lastValueFrom } from "rxjs";
import { CurrencyPipe, DatePipe, DecimalPipe } from "@angular/common";

@Component({
    selector: 'ci-card--fundamental-indicators',
    template: `
    <mat-card class="invest-card">
        <mat-card-header>
            <mat-card-title>
                @if(stage === 'config'){
                    Análise Fundamentalista
                }@else{
                    {{ data?.ticker }} - {{ data?.company }}
                }
            </mat-card-title>
            <mat-card-subtitle>
                @if(stage === 'config'){
                    Informe o ticker do ativo
                }@else{
                    Balanço ref: {{ data?.statementReferenceDate | date:'dd/MM/yyyy' }}
                }
            </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
            @if(stage === 'config'){
                <div class="config-row">
                    <mat-form-field class="full-width">
                        <mat-label>Ticker (ex: WEGE3)</mat-label>
                        <input matInput [(ngModel)]="ticker" (keydown.enter)="update()" />
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="update()" [disabled]="!ticker">
                        Analisar
                    </button>
                </div>
            }@else{
                <div class="results-container">
                    <div class="price-header">
                        <h2>{{ data?.price | currency:'BRL' }}</h2>
                        <small>Cotação em {{ data?.date | date:'dd/MM/yyyy' }}</small>
                    </div>
                    
                    <div class="indicators-grid">
                        <div class="indicator-box">
                            <span class="label">P/L</span>
                            <span class="value">{{ data?.indicators?.pl | number:'1.2-2' }}</span>
                        </div>
                        <div class="indicator-box">
                            <span class="label">P/VP</span>
                            <span class="value">{{ data?.indicators?.pvp | number:'1.2-2' }}</span>
                        </div>
                        <div class="indicator-box">
                            <span class="label">LPA</span>
                            <span class="value">{{ data?.indicators?.lpa | currency:'BRL' }}</span>
                        </div>
                        <div class="indicator-box">
                            <span class="label">VPA</span>
                            <span class="value">{{ data?.indicators?.vpa | currency:'BRL' }}</span>
                        </div>
                    </div>

                    <button mat-stroked-button class="btn-edit" (click)="stage = 'config'">Alterar Ativo</button>
                </div>
            }
        </mat-card-content>
    </mat-card>
    `,
    styles: [`
        .invest-card {  }
        .full-width { width: 100%; }
        .config-row { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .results-container { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
        .price-header { text-align: center; border-bottom: 1px solid var(--mat-sys-outline-variant, #eee); padding-bottom: 12px; }
        .price-header h2 { margin: 0; font-size: 2rem; color: var(--mat-sys-tertiary, #2e7d32); }
        .price-header small { color: var(--mat-sys-on-surface-variant, #666); }
        .indicators-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .indicator-box { background: var(--mat-sys-surface-container-low, var(--mat-sys-surface, #f5f5f5)); padding: 12px; border-radius: 8px; text-align: center; display: flex; flex-direction: column; border: 1px solid var(--mat-sys-outline-variant, #eee);}
        .indicator-box .label { font-size: 0.8rem; color: var(--mat-sys-on-surface-variant, #555); text-transform: uppercase; font-weight: bold;}
        .indicator-box .value { font-size: 1.2rem; color: var(--mat-sys-on-surface, #111); font-weight: 500; margin-top: 4px;}
        .btn-edit { margin-top: 16px; }
    `],
    standalone: true,
    imports: [
        CoreModule, MatFormFieldModule, MatInputModule, FormsModule,
        MatCardModule, MatButtonModule, CurrencyPipe, DatePipe, DecimalPipe
    ]
})
export class FundamentalIndicatorsCard implements OnInit {
    stage: 'config' | 'run' = 'config';
    data?: any;
    @Input() ticker?: string;

    // Substitua pela URL base real da sua API NestJS
    private readonly API_URL = '/indicators';

    constructor(private readonly http: HttpClient) { }

    ngOnInit(): void {
        if (this.ticker) this.update();
    }

    async update() {
        if (this.ticker && this.ticker.trim().length > 0) {
            try {
                this.data = await lastValueFrom(
                    this.http.post(`${this.API_URL}/${this.ticker.toUpperCase()}`, {})
                );
                this.stage = 'run';
            } catch (error) {
                console.error('Erro ao buscar indicadores:', error);
                alert('Erro ao buscar dados. Verifique se o ticker existe.');
            }
        }
    }
}

export const FundamentalIndicatorsCardInfo = {
    title: 'Indicadores Fundamentalistas',
    descricao: `Exibe P/L, P/VP, LPA e VPA de um ativo da B3.`,
    tags: ['Investimentos', 'B3', 'Análise'],
    componentRef: FundamentalIndicatorsCard,
    componentVersion: '1.0.0',
    componentName: 'FundamentalIndicatorsCard',
    settings: {
        ticker: { label: 'Ticker' }
    }
};