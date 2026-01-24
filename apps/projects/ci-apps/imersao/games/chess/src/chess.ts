import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@ci/core';
import { Chess, Move } from 'chess.js';
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
    board: any[][] = [];
    selectedSquare: string | null = null;
    isVsIA = false; // Flag para o modo IA
    ngOnInit() {
        this.updateBoard();
    }
    start() {
        this.isVsIA = false;
        this.stage = 'play';
        this.resetGame();
    }
    // Inicia jogo contra a máquina
    startVsIA() {
        this.isVsIA = true;
        this.resetGame();
    }
    private resetGame() {
        this.stage = 'play';
        this.game.reset();
        this.updateBoard();
    }
    // Atualiza a representação visual do tabuleiro
    updateBoard() {
        this.board = this.game.board();
    }
    // Lógica de clique na casa
    onSquareClick(rank: number, file: number) {
        if (this.game.isGameOver()) return;

        // Se for turno da IA, bloqueia clique do jogador
        if (this.isVsIA && this.game.turn() === 'b') return;

        const coords = this.getCoords(rank, file);
        if (this.selectedSquare) {
            this.makeMove(this.selectedSquare, coords);
            this.selectedSquare = null;
        } else {
            const piece = this.game.get(coords as any);
            if (piece && piece.color === this.game.turn()) {
                this.selectedSquare = coords;
            }
        }
    }
    makeMove(from: string, to: string) {
        try {
            const move = this.game.move({ from, to, promotion: 'q' }); // promoção padrão para dama
            if (move) {
                this.updateBoard();
                if (this.game.isGameOver()) {
                    this.checkGameStatus();
                } else if (this.isVsIA && this.game.turn() === 'b') {
                    // Pequeno delay para a jogada da IA não ser instantânea
                    setTimeout(() => this.makeAIMove(), 600);
                }
            }
        } catch (e) {
            console.log("Movimento inválido");
        }
    }
    makeAIMove() {
        const possibleMoves = this.game.moves();

        // Se não houver movimentos, o jogo acabou
        if (possibleMoves.length === 0) return;

        // Escolhe um movimento aleatório (IA Nível 1)
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        this.game.move(possibleMoves[randomIndex]);

        this.updateBoard();
        this.checkGameStatus();
    }
    getCoords(rank: number, file: number): string {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return files[file] + (8 - rank);
    }
    checkGameStatus() {
        if (this.game.isGameOver()) {
            alert('Fim de jogo!');
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
}