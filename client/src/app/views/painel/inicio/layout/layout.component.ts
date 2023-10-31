import { Component } from "@angular/core";

@Component({
    selector: 'px-layout',
    template: `
    Configurações da Prancheta
    <h4>Layout:</h4>
    <div class="layouts">
        <ng-container *ngFor="let layout of layouts">
            <ci-layout-thumb (click)="layoutSelecionado=layout" [data]="layout" [(data)]="layoutSelecionado" ></ci-layout-thumb>
        </ng-container>
    </div>
    `,
    styles: [
        `
        .layouts{
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }`
    ]
})
export class LayoutComponent {
    layouts = [
        '1-3-1',
        '2-2-2',
        '1-1-1',
        '4-1-2-2',
    ];
    layoutSelecionado?: string;
}