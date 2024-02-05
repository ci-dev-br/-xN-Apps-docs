import { Component } from "@angular/core";
import { WindowService } from "src/app/components/window/window.service";
import { AdicionarWidgetComponent } from "./adicionar-widget/adicionar-widget.component";

@Component({
    selector: 'px-inicio',
    template: `
        
        <div class="cards">
            <!-- <ng-container  ></ng-container> -->
            <!-- <ng-container> -->
                <div class="empty-card">
                    <button mat-icon-button matTooltip="Adicionar Visualização" [matMenuTriggerFor]="menu" ><mat-icon>add</mat-icon></button>
                    <mat-menu #menu>
                        <button mat-menu-item (click)="adicionarCard()" >
                            Pesquisar por Widget
                        </button>
                        <button mat-menu-item (click)="instalarWidget()" >
                            Instalar Widgets
                        </button>
                        <button mat-menu-item (click)="criarWidget()" >
                            Criar Widget
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
export class InicioComponent {
    constructor(
        private window: WindowService,
    ) { }
    adicionarCard() {
        this.window.open(AdicionarWidgetComponent, {});
    }
    criarWidget() {

    }
    instalarWidget() {

    }
}