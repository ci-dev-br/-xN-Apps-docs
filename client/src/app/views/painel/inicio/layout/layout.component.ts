import { Component } from "@angular/core";

@Component({
    selector: 'px-layout',
    template: `
    <div class="title">
        Configurações da Prancheta
    </div>
    <div class="wrapper">
        <h4>Layout:</h4>
        <div class="layouts">
            <ng-container *ngFor="let layout of layouts">
                <ci-layout-thumb
                    (click)="layoutSelecionado=layout" 
                    [data]="layout" ></ci-layout-thumb>
            </ng-container>
        </div>
    </div>
    `,
    styles: [
        `
        .title{
            background: 
                linear-gradient(
                    137deg,
                    rgba(255,255,255,.02) 0%, 
                    rgba(255,255,255,.44) 100%);
        }
        .layouts{
            padding: 0 ;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .wrapper,.title{
            padding: 10px ;
        }
        h1,h2,h3,h4,h5,h6{
            padding: 0;
            margin: 0;
            text-weight: normal;
        }
        `
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