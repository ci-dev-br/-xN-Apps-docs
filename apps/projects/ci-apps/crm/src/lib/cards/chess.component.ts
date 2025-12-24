import { Component } from "@angular/core";
import { ChessGameComponent } from "@ci/apps/imersao/chess";

@Component({
    selector: 'ci-card--chess',
    template: `
        <ci-chess-game></ci-chess-game>
    `,
    standalone: true,
    imports: [
        ChessGameComponent
    ]
})
export class ChessCard {
}
export const ChessPayoutCardInfo = {
    title: 'Chess',
    descricao: `Jogo de Xadrez`,
    tags: ['Game', 'Chess', 'Xadrez'],
    componentRef: ChessCard,
    componentVersion: '1.0.0',
    componentName: 'Chess',
    settings: {

    }
};