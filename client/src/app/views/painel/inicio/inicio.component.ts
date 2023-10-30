import { Component } from "@angular/core";
import { JanelaService } from "src/app/components/janela/janela.service";
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
                        <button mat-menu-item >
                            Instalar Widgets
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
        private janela: JanelaService,
    ) { }
    adicionarCard() {
        this.janela.open(AdicionarWidgetComponent, {});
    }
}