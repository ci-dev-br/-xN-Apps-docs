import { CommonModule } from '@angular/common';
import { Component, OnInit, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicBlockNode, DynamicComponentDefinition } from '../blocks-builder/blocks-builder.models';
import { DYNAMIC_DEFAULT_COMPONENTS } from '../blocks-builder/default-components';

export const DYNAMIC_PREVIEW_STORAGE_KEY = 'ci-dynamic-preview-block';

@Component({
    selector: 'ci-component-preview',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
    ],
    template: `
        <div class="preview-route-toolbar">
            <button mat-stroked-button (click)="voltar()">
                <mat-icon>arrow_back</mat-icon>
                Voltar ao Construtor
            </button>
            <div class="preview-meta" *ngIf="block">
                <mat-icon>{{ definition?.icon || 'widgets' }}</mat-icon>
                <strong>{{ block.label || definition?.title || block.componentName }}</strong>
                <code>{{ block.componentName }}</code>
            </div>
        </div>

        <div class="preview-route-stage">
            <ng-container *ngIf="block && definition?.componentRef as compRef; else fallbackOrEmpty">
                <ng-container *ngComponentOutlet="compRef; inputs: block.inputs || {}"></ng-container>
            </ng-container>

            <ng-template #fallbackOrEmpty>
                <div class="preview-empty-state" *ngIf="!block">
                    <mat-icon>visibility_off</mat-icon>
                    <p>Nenhum componente selecionado para pré-visualização.</p>
                    <button mat-flat-button color="primary" (click)="voltar()">Ir para o Dynamic</button>
                </div>
                <div class="preview-generic-state" *ngIf="block && !definition?.componentRef">
                    <h3>{{ block.label || block.componentName }}</h3>
                    <pre>{{ block.inputs | json }}</pre>
                </div>
            </ng-template>
        </div>
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            padding: 16px;
            gap: 12px;
        }
        .preview-route-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 16px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.85);
            border: 1px solid rgba(15, 23, 42, 0.08);
        }
        .preview-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            code {
                background: #f1f5f9;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 12px;
            }
        }
        .preview-route-stage {
            flex: 1;
            min-height: 0;
            overflow: auto;
            padding: 16px;
            border-radius: 12px;
            background: #fff;
            border: 1px solid rgba(15, 23, 42, 0.08);
        }
        .preview-empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 12px;
            color: #64748b;
            mat-icon { font-size: 48px; width: 48px; height: 48px; }
        }
        .preview-generic-state pre {
            background: #0f172a;
            color: #e2e8f0;
            padding: 12px;
            border-radius: 8px;
            overflow: auto;
        }
    `],
})
export class ComponentPreviewComponent implements OnInit {
    protected block: DynamicBlockNode | null = null;
    protected definition?: DynamicComponentDefinition;

    constructor(
        @Optional() private router?: Router,
        @Optional() private route?: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        const navState = (typeof window !== 'undefined' ? window.history?.state : null) || {};
        if (navState?.block) {
            this.block = navState.block;
        } else if (typeof sessionStorage !== 'undefined') {
            try {
                const raw = sessionStorage.getItem(DYNAMIC_PREVIEW_STORAGE_KEY);
                if (raw) {
                    this.block = JSON.parse(raw);
                }
            } catch {
                this.block = null;
            }
        }

        if (this.block) {
            this.definition = DYNAMIC_DEFAULT_COMPONENTS.find(
                c => c.name === this.block!.componentName
            );
        }
    }

    voltar(): void {
        if (this.router && this.route) {
            this.router.navigate(['..'], { relativeTo: this.route });
        } else {
            this.router?.navigate(['/Dynamic']);
        }
    }
}
