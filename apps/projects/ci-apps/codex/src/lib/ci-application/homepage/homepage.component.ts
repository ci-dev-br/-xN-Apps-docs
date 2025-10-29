import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { CoreModule } from "@ci/core";


@Component({
    standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
    ],
    selector: 'ci-homepage',
    template: `
        <style>
            :host{
                display: flex; 
                flex-direction: column;
                flex: auto;
                justify-self: stretch;
                align-self: stretch;
            }
            .col{
                display: flex; 
                flex-direction: column;
            }
            .row{
                display: flex;
                flex-direction: row;
            }

            .miniaturas{
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                flex: auto;
                justify-self: stretch;
                gap: 6px;
                padding: 24px;
                overflow: auto;
                height: auto;

                background: rgba(255,255,255,.05);
            }

            .miniatura{
                width: 120px;
                height: 120px;
                background-color: white;
                border-radius: 12px;
                box-shadow: 2px 3px 6px 1px rgba(0,0,0,.33);

                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                cursor: pointer;
            }
            h1{
                width: auto;
                padding: 0;
                margin: 0;
                font-size: 12px;

                flex: 100%;
            }
            .auto{
                flex: auto;
            }
        </style>
        <div class="row auto">
            <div class="col">
                <button mat-raised-button >
                    Documentações
                </button>
                <button mat-raised-button>
                    Criar
                </button>
                <button mat-raised-button>
                    Explorar
                </button>
                <button mat-raised-button>
                    Importar
                </button>
            </div>
            <div class="miniaturas">
                <h1>Ultimas recentes</h1>
                <div class="miniatura">
                    Editor de Texto
                </div>
                <div class="miniatura">
                    Bar Chart
                </div>
                <div class="miniatura">
                    Pie Chart
                </div>
                <div class="miniatura">
                    XD Editor
                </div>
                <h1>Arquivos mais visitados</h1>
                <div class="miniatura">
                    XD Editor
                </div>
            </div>
        </div>
    `
})
export class HomepageComponent {
    constructor() { }
}