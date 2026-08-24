import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { CoreModule } from "@ci/core";
import { lastValueFrom } from "rxjs";
import { CurrencyPipe, DatePipe, DecimalPipe } from "@angular/common";

interface MacroIndicator {
    name: string;
    value: number;
    date: string;
}

@Component({
    selector: 'ci-card--macro-indicators',
    template: `
    <mat-card class="macro-card">
        <mat-card-header>
            <mat-card-title>Panorama Econômico</mat-card-title>
            <mat-card-subtitle>
                Atualizado em: {{ lastUpdate | date:'dd/MM/yyyy HH:mm' }}
            </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
            @if(loading){
                <div class="loading-state">Carregando indicadores...</div>
            }@else{
                <div class="indicators-grid">
                    <!-- Iterando sobre os indicadores retornados -->
                    @for (item of indicators; track item.name) {
                        <div class="indicator-box">
                            <span class="indicator-name">{{ formatName(item.name) }}</span>
                            <span class="indicator-value">
                                {{ formatValue(item.name, item.value) }}
                            </span>
                            <span class="indicator-date">ref: {{ item.date | date:'dd/MM' }}</span>
                        </div>
                    } @empty {
                        <p class="empty-state">Nenhum indicador encontrado.</p>
                    }
                </div>
            }
        </mat-card-content>
        
        <mat-card-actions align="end">
            <button mat-button (click)="loadData()" [disabled]="loading">
                Atualizar
            </button>
        </mat-card-actions>
    </mat-card>
    `,
    styles: [`
        .macro-card {  }
        .indicators-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
        }
        .indicator-box { 
            background: #fafafa; 
            border: 1px solid #eee;
            border-radius: 8px; 
            display: flex; 
            flex-direction: column;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .indicator-name { 
            font-size: 0.85rem; 
            color: #555; 
            text-transform: uppercase; 
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .indicator-value { 
            font-size: 1.5rem; 
            color: #1a237e; 
            font-weight: bold; 
            margin: 8px 0 4px 0;
        }
        .indicator-date { 
            font-size: 0.7rem; 
            color: #999; 
        }
        .loading-state, .empty-state {
            text-align: center;
            color: #666;
        }
    `],
    standalone: true,
    imports: [
        CoreModule, MatCardModule, MatButtonModule, MatIconModule,
        CurrencyPipe, DatePipe, DecimalPipe
    ],
    providers: [CurrencyPipe, DecimalPipe]
})
export class MacroIndicatorsCard implements OnInit {
    indicators: MacroIndicator[] = [];
    loading: boolean = true;
    lastUpdate: Date = new Date();

    // Substitua pela URL real da sua API NestJS
    private readonly API_URL = 'https://apps.ci.dev.br/api/macro-indicators/latest';

    constructor(
        private readonly http: HttpClient,
        private readonly currencyPipe: CurrencyPipe,
        private readonly decimalPipe: DecimalPipe
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    async loadData() {
        this.loading = true;
        try {
            // Espera-se que a API retorne um array com o último registro de cada indicador
            this.indicators = await lastValueFrom(
                this.http.post<MacroIndicator[]>(this.API_URL, {})
            );
            this.lastUpdate = new Date();
        } catch (error) {
            console.error('Erro ao buscar indicadores macroeconômicos:', error);
        } finally {
            this.loading = false;
        }
    }

    // Método para formatar o nome de exibição no Card
    formatName(name: string): string {
        const nameMap: Record<string, string> = {
            'META_SELIC': 'Meta Selic',
            'SELIC': 'Taxa Selic',
            'CDI': 'Taxa CDI',
            'IPCA': 'IPCA (Mês)',
            'IGPM': 'IGP-M (Mês)',
            'DOLAR': 'Dólar',
            'EURO': 'Euro'
        };
        return nameMap[name] || name;
    }

    // Formata o valor dependendo do tipo (Moeda vs Porcentagem)
    formatValue(name: string, value: number): string | null {
        if (name === 'DOLAR' || name === 'EURO') {
            return this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-4');
        }
        // Para taxas (Selic, CDI, IPCA), exibimos como porcentagem
        return `${this.decimalPipe.transform(value, '1.2-2')}%`;
    }
}

export const MacroIndicatorsCardInfo = {
    title: 'Panorama Econômico',
    descricao: `Exibe os principais indicadores de mercado (Dólar, Selic, CDI, IPCA).`,
    tags: ['Economia', 'Mercado', 'BCB'],
    componentRef: MacroIndicatorsCard,
    componentVersion: '1.0.0',
    componentName: 'MacroIndicatorsCard',
    settings: {} // Sem configurações necessárias, roda automaticamente
};