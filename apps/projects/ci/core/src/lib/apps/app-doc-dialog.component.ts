import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IAppDocumentation } from './app-docs.model';

@Component({
    selector: 'ci-app-doc-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
        <div class="doc-dialog-container">
            <header class="doc-dialog-header">
                <div class="doc-header-info">
                    <div class="doc-icon-badge">
                        <mat-icon>{{ data.icon || 'apps' }}</mat-icon>
                    </div>
                    <div>
                        <div class="doc-category" *ngIf="data.category">{{ data.category }}</div>
                        <h2 mat-dialog-title class="doc-title">{{ data.title }}</h2>
                    </div>
                </div>
                <button mat-icon-button mat-dialog-close class="close-btn" aria-label="Fechar">
                    <mat-icon>close</mat-icon>
                </button>
            </header>

            <mat-dialog-content class="doc-dialog-content">
                <p class="doc-summary">{{ data.summary }}</p>

                <div class="doc-section" *ngIf="data.features && data.features.length > 0">
                    <h3 class="section-title">
                        <mat-icon class="section-icon">stars</mat-icon>
                        Principais Recursos
                    </h3>
                    <ul class="feature-list">
                        <li *ngFor="let feat of data.features">
                            <mat-icon class="check-icon">check_circle</mat-icon>
                            <span>{{ feat }}</span>
                        </li>
                    </ul>
                </div>

                <div class="doc-section" *ngIf="data.quickStart && data.quickStart.length > 0">
                    <h3 class="section-title">
                        <mat-icon class="section-icon">rocket_launch</mat-icon>
                        Como Começar
                    </h3>
                    <ol class="step-list">
                        <li *ngFor="let step of data.quickStart; let i = index">
                            <span class="step-number">{{ i + 1 }}</span>
                            <span class="step-text">{{ step }}</span>
                        </li>
                    </ol>
                </div>

                <div class="doc-tips" *ngIf="data.tips && data.tips.length > 0">
                    <div class="tip-card" *ngFor="let tip of data.tips">
                        <mat-icon class="tip-icon">lightbulb</mat-icon>
                        <span>{{ tip }}</span>
                    </div>
                </div>
            </mat-dialog-content>

            <mat-dialog-actions align="end" class="doc-dialog-actions">
                <button mat-flat-button color="primary" [mat-dialog-close]="true" class="start-btn">
                    <mat-icon>arrow_forward</mat-icon>
                    Começar a Usar
                </button>
            </mat-dialog-actions>
        </div>
    `,
    styles: [`
        .doc-dialog-container {
            padding: 1.5rem;
            max-width: 600px;
            font-family: inherit;
            color: var(--mat-sys-on-surface, var(--mat-app-text-color, #212121));
            background: var(--mat-sys-surface, var(--mat-app-background-color, #ffffff));
        }
        .doc-dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
            border-bottom: 1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, 0.08));
            padding-bottom: 1rem;
        }
        .doc-header-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .doc-icon-badge {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--mat-sys-primary, #1976d2), var(--mat-sys-primary-container, #2196f3));
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--mat-sys-on-primary, #ffffff);
            box-shadow: 0 4px 12px var(--mat-sys-primary-container, rgba(33, 150, 243, 0.3));
        }
        .doc-category {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--mat-sys-on-surface-variant, #666666);
            font-weight: 600;
        }
        .doc-title {
            margin: 0;
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--mat-sys-on-surface, #212121);
        }
        .close-btn {
            color: var(--mat-sys-on-surface-variant, #757575);
        }
        .doc-dialog-content {
            max-height: 65vh;
            overflow-y: auto;
            padding: 0 0.25rem;
        }
        .doc-summary {
            font-size: 1rem;
            line-height: 1.6;
            color: var(--mat-sys-on-surface-variant, #424242);
            margin-bottom: 1.5rem;
        }
        .doc-section {
            margin-bottom: 1.5rem;
        }
        .section-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.05rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--mat-sys-primary, #1a237e);
        }
        .section-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: var(--mat-sys-primary, #1976d2);
        }
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .feature-list li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.925rem;
            color: var(--mat-sys-on-surface, #37474f);
        }
        .check-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--mat-sys-primary, #2e7d32);
        }
        .step-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .step-list li {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            font-size: 0.925rem;
            color: var(--mat-sys-on-surface, #37474f);
        }
        .step-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--mat-sys-primary-container, #e3f2fd);
            color: var(--mat-sys-on-primary-container, #1565c0);
            font-weight: 700;
            font-size: 0.75rem;
        }
        .step-text {
            line-height: 1.4;
        }
        .doc-tips {
            margin-top: 1.25rem;
        }
        .tip-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--mat-sys-tertiary-container, #fff8e1);
            border-left: 4px solid var(--mat-sys-tertiary, #ffb300);
            padding: 0.75rem 1rem;
            border-radius: 4px;
            font-size: 0.875rem;
            color: var(--mat-sys-on-tertiary-container, #795548);
        }
        .tip-icon {
            color: var(--mat-sys-tertiary, #ffb300);
            font-size: 20px;
            width: 20px;
            height: 20px;
        }
        .doc-dialog-actions {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, 0.08));
        }
        .start-btn {
            border-radius: 8px;
            font-weight: 600;
            padding: 0 1.5rem;
        }
    `]
})
export class AppDocDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<AppDocDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IAppDocumentation
    ) { }
}
