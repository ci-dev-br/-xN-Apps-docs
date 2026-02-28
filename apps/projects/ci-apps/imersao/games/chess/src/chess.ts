import { Component, ComponentRef, ElementRef, OnInit, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@ci/core';
import { ChessService } from '@ci/portal-api';
import { Chess, Move } from 'chess.js';
import { lastValueFrom } from 'rxjs';
const PIECE_VALUES: { [key: string]: number } = {
    p: 10 * 2.1,
    n: 30 * 2.2,
    b: 30 * 2.3,
    r: 50 * 2.4,
    q: 90 * 3.5,
    k: 900 * 2
};
@Component({
    selector: 'ci-chess-game',
    standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
    ],
    templateUrl: './chess.html',
    styleUrls: ['./chess.scss']
})
export class ChessGameComponent implements OnInit {
    stage: 'menu' | 'play' | 'viewer' = 'menu';
    player: 'white' | 'black' = 'white';
    game = new Chess();
    virtualGame = new Chess();
    board: any[][] = [];
    selectedSquare: string | null = null;
    isVsIA = false; // Flag para o modo IA
    niveis = ['easy',
        'medium',
        'hard',]
    difficulty: 'easy' | 'medium' | 'hard' = 'hard';
    ngOnInit() {
        this.updateBoard();
    }
    start() {
        this.isVsIA = false;
        this.stage = 'play';
        this.resetGame();
    }
    startVsIA() {
        this.isVsIA = true;
        this.resetGame();
    }
    private resetGame() {
        this.stage = 'play';
        this.game.reset();
        this.updateBoard();
    }
    updateBoard() {
        this.board = this.game.board();
    }
    onSquareClick(rank: number, file: number) {
        if (this.game.isGameOver()) return;
        if (this.isVsIA && this.game.turn() === 'b') return;
        const coords = this.getCoords(rank, file);
        if (this.selectedSquare) {
            this.criarMovimento(this.selectedSquare, coords);
            this.selectedSquare = null;
        } else {
            const piece = this.game.get(coords as any);
            if (piece && piece.color === this.game.turn()) {
                this.selectedSquare = coords;
            }
        }
    }
    criarMovimento(from: string, to: string) {
        try {
            const movimento = this.game.move({ from, to, promotion: 'q' });
            if (movimento) {
                this.updateBoard();
                if (this.game.isGameOver()) {
                    this.checkGameStatus();
                } else if (this.isVsIA && this.game.turn() === 'b') {
                    setTimeout(() => this.makeAIMove(), 600);
                }
            }
        } catch (e) {
            console.log("Movimento inválido");
        }
    }
    /* private getHeuristicMove(moves: any[]): any {
        try {
            return moves.sort((a, b) => {
                const aValue = a.captured ? PIECE_VALUES[a.captured] : 0;
                const bValue = b.captured ? PIECE_VALUES[b.captured] : 0;
                return bValue - aValue;
            })[0];
        } catch (error) {
            error;
            debugger;
        }
    } */
    constructor(
        private chess: ChessService,
        @Optional() private readonly er: ElementRef<any>,
        @Optional() private readonly cr: ComponentRef<any>
    ) {
        er;
        cr
    }

    async makeAIMove() {
        const possibilidades = this.game.moves({ verbose: true });
        let moviment = undefined;
        if (possibilidades.length === 0) return;
        try {
            let reaction = await lastValueFrom(this.chess.chessMove({ body: { fen: this.game.fen() } }));
            if ('move' in reaction) moviment = reaction.move as any;
        } catch (error) {
            console.trace(error);
        }
        if (!!moviment)
            this.game.move(moviment);
        this.updateBoard();
        this.checkGameStatus();
    }
    getCoords(rank: number, file: number): string {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return files[file] + (8 - rank);
    }
    checkGameStatus() {
        if (this.game.isGameOver()) {
            // Informar se ganhou e perdeu
            if (this.game.isCheckmate()) {
                const winner = this.game.turn() === 'w' ? 'Black' : 'White';
                alert(`Checkmate! ${winner} wins!`);
            } else if (this.game.isDraw()) {
                alert('Game over! It\'s a draw.');
            } else {
                alert('Game over!');
            }
            // Reiniciar o jogo
            this.stage = 'menu';
        }
    }
    getPieceSymbol(piece: any): string {
        if (!piece) return '';
        const symbols: { [key: string]: string } = {
            'p': '♙', 'n': '♘', 'b': '♗', 'r': '♖', 'q': '♕', 'k': '♔',
            'P': '♟', 'N': '♞', 'B': '♝', 'R': '♜', 'Q': '♛', 'K': '♚'
        };
        return symbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type];
    }
    async ajudaMe() {
        let jogada = await lastValueFrom(this.chess.chessMove({ body: { fen: this.game.fen() } }));
        if (!!jogada?.move) {
            this.game.move(jogada.move as any);
            this.updateBoard();
            this.checkGameStatus();
        }
    }
    async desistir() {
        alert('Você desistiu da partida!');
        this.stage = 'menu';
    }
}