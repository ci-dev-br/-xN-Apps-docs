import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Card dinâmico para atalho operacional e resumo de aplicativo no Board
 */
@Component({
    selector: 'ci-app-quick-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
    template: `
        <mat-card class="app-quick-card">
            <mat-card-header>
                <div mat-card-avatar class="app-avatar" [style.background-color]="appColor || '#3f51b5'">
                    <mat-icon>{{ appIcon || 'apps' }}</mat-icon>
                </div>
                <mat-card-title>{{ appName }}</mat-card-title>
                <mat-card-subtitle>{{ appCategory || 'Aplicativo Integrado' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
                <p class="app-desc">{{ appDescription || 'Acesse as funcionalidades completas desta aplicação.' }}</p>
                <div class="app-status-badge">
                    <span class="status-dot"></span>
                    <span>Disponível no Tenant</span>
                </div>
            </mat-card-content>
            <mat-card-actions align="end">
                <a mat-button color="primary" [href]="appUrl || '#'">
                    <mat-icon>launch</mat-icon> Abrir
                </a>
            </mat-card-actions>
        </mat-card>
    `,
    styles: [`
        .app-quick-card {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: var(--mat-sys-surface, #ffffff);
            border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
            border-radius: 12px;
            box-sizing: border-box;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            transition: transform 0.2s ease, box-shadow 0.2s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            }
        }
        .app-avatar {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            color: #ffffff;
            width: 40px;
            height: 40px;
        }
        .app-desc {
            font-size: 0.85rem;
            color: var(--mat-sys-on-surface-variant, #666);
            margin: 10px 0 6px 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .app-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.72rem;
            font-weight: 500;
            color: var(--mat-sys-tertiary, #2e7d32);
            background: var(--mat-sys-tertiary-container, rgba(46, 125, 50, 0.08));
            padding: 2px 8px;
            border-radius: 12px;
            margin-top: 4px;
        }
        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--mat-sys-tertiary, #2e7d32);
        }
    `]
})
export class AppQuickCardComponent {
    @Input() appName = 'Aplicativo';
    @Input() appUrl = '/painel';
    @Input() appIcon = 'apps';
    @Input() appColor = '#3f51b5';
    @Input() appCategory = 'Geral';
    @Input() appDescription = '';
}
