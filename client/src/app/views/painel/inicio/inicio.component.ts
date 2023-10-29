import { Component } from "@angular/core";

@Component({
    selector: 'px-inicio',
    template: `
        <div class="cards">
            <!-- <ng-container  ></ng-container> -->
            <!-- <ng-container> -->
                <div class="empty-card">
                    <button mat-icon-button matTooltip="Adicionar Visualização" [matMenuTriggerFor]="menu" ><mat-icon>add</mat-icon></button>
                    <mat-menu #menu>
                        <button mat-menu-item >
                            Adicionar Widget
                        </button>
                        <button mat-menu-item >
                            Adicionar IFrame
                        </button>
                        <button mat-menu-item >
                            Instalar Widget
                        </button>
                    </mat-menu>
                </div>
            <!-- </ng-container> -->
        </div>
    `,
    styleUrls: [
        './inicio.component.scss'
    ]
})
export class InicioComponent { }