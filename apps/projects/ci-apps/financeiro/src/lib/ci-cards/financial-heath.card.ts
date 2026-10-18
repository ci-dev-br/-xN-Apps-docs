import { HttpClient } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CoreModule } from "@ci/core";
import { lastValueFrom } from "rxjs";
import { CurrencyPipe, DatePipe, NgClass } from "@angular/common";

@Component({
    selector: 'ci-card--financial-health',
    template: `
    <mat-card class="invest-card">
        <mat-card-header>
            <mat-card-title>
                @if(stage === 'config'){ Saúde Financeira }
                @else{ DRE e Balanço - {{ data?.companyName }} }
            </mat-card-title>
            <mat-card-subtitle>
                @if(stage === 'config'){ Informe o ticker }
                @else{ Ref: {{ data?.referenceDate | date:'dd/MM/yyyy' }} ({{ data?.documentType }}) }
            </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
            @if(stage === 'config'){
                <div class="config-row">
                    <mat-form-field class="full-width">
                        <mat-label>Ticker (ex: PETR4)</mat-label>
                        <input matInput [(ngModel)]="ticker" (keydown.enter)="update()" />
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="update()" [disabled]="!ticker">
                        Carregar Balanço
                    </button>
                </div>
            }@else{
                <div class="financial-grid">
                    <div class="fin-section">
                        <h4>Resultado (DRE)</h4>
                        <div class="fin-row">
                            <span>Receita Líquida</span>
                            <strong>{{ data?.netRevenue | currency:'BRL' }}</strong>
                        </div>
                        <div class="fin-row">
                            <span>EBITDA</span>
                            <strong>{{ data?.ebitda | currency:'BRL' }}</strong>
                        </div>
                        <div class="fin-row highlight" [ngClass]="{'profit': data?.netIncome > 0, 'loss': data?.netIncome <= 0}">
                            <span>Lucro Líquido</span>
                            <strong>{{ data?.netIncome | currency:'BRL' }}</strong>
                        </div>
                    </div>

                    <div class="fin-section">
                        <h4>Posição Patrimonial</h4>
                        <div class="fin-row">
                            <span>Ativo Total</span>
                            <strong>{{ data?.totalAssets | currency:'BRL' }}</strong>
                        </div>
                        <div class="fin-row">
                            <span>Patrimônio Líquido</span>
                            <strong>{{ data?.equity | currency:'BRL' }}</strong>
                        </div>
                        <div class="fin-row warning">
                            <span>Dívida Bruta</span>
                            <strong>{{ data?.grossDebt | currency:'BRL' }}</strong>
                        </div>
                    </div>
                    
                    <button mat-stroked-button class="full-width mt-16" (click)="stage = 'config'">Nova Pesquisa</button>
                </div>
            }
        </mat-card-content>
    </mat-card>
    `,
    styles: [`
        .invest-card {   }
        .full-width { width: 100%; }
        .mt-16 { margin-top: 16px; }
        .config-row { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .financial-grid { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; }
        .fin-section { background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #eee; }
        .fin-section h4 { margin: 0 0 12px 0; color: #444; font-size: 0.9rem; text-transform: uppercase; border-bottom: 2px solid #ddd; padding-bottom: 4px;}
        .fin-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: #555; }
        .fin-row strong { color: #111; }
        .fin-row.highlight { padding-top: 8px; border-top: 1px dashed #ccc; font-size: 1rem; }
        .fin-row.profit strong { color: #2e7d32; }
        .fin-row.loss strong { color: #c62828; }
        .fin-row.warning strong { color: #e65100; }
    `],
    standalone: true,
    imports: [CoreModule, MatFormFieldModule, MatInputModule, FormsModule, MatCardModule, MatButtonModule, CurrencyPipe, DatePipe, NgClass]
})
export class FinancialHealthCard implements OnInit {
    stage: 'config' | 'run' = 'config';
    data?: any;
    @Input() ticker?: string;

    // URL do endpoint que criaremos no NestJS (veja abaixo)
    private readonly API_URL = 'https://apps.ci.dev.br/api/companies/financials';

    constructor(private readonly http: HttpClient) { }

    ngOnInit(): void {
        if (this.ticker) this.update();
    }

    async update() {
        if (this.ticker) {
            try {
                this.data = await lastValueFrom(
                    this.http.post(`${this.API_URL}/${this.ticker.toUpperCase()}/latest`, {})
                );
                this.stage = 'run';
            } catch (error) {
                alert('Erro ao buscar dados do balanço.');
            }
        }
    }
}

export const FinancialHealthCardInfo = {
    title: 'Saúde Financeira',
    descricao: `DRE e Balanço consolidado (CVM) de uma empresa.`,
    tags: ['CVM', 'Fundamentos', 'Balanço'],
    componentRef: FinancialHealthCard,
    componentVersion: '1.0.0',
    componentName: 'FinancialHealthCard',
    settings: { ticker: { label: 'Ticker' } }
};