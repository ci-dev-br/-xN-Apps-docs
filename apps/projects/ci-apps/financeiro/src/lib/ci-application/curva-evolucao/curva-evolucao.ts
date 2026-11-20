import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'ci-curva-evolucao',
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        CurrencyPipe,
        CommonModule,
    ],
    template: `
periodos)<div class="chart-card-header">
            <div>
                <h4>Curva de Evolução Patrimonial & Ganhos vs. Perdas</h4>
                <p>Passe o mouse ou clique sobre os marcos temporais para inspecionar ganhos (+), perdas (-) e posição acumulada em R$.</p>
            </div>
            <div class="header-right-controls">
                <div class="chart-legend-inline">
                    <span class="leg-item"><i class="dot line-pat"></i> Patrimônio (R$)</span>
                    <span class="leg-item"><i class="dot bar-gain"></i> Ganhos (+)</span>
                    <span class="leg-item"><i class="dot bar-loss"></i> Perdas (-)</span>
                </div>
                @if (!dashboard) {
                    <div class="period-pills">
                        @for (p of periodos; track p) {
                            <button type="button" class="p-btn" [class.active]="periodo === p" (click)="trocarPeriodo(p)">{{ p }}</button>
                        }
                    </div>
                }
            </div>
        </div>`
})
export class CurvaEvolucao {
    constructor() { }

    @Input() periodo?: any;
    @Input() dashboard?: any;
    @Input() periodos?: any[];

    @Output('trocar') trocarEvent = new EventEmitter<any>();

    trocarPeriodo(p: any) {
        this.trocarEvent.emit(p)
    }
}