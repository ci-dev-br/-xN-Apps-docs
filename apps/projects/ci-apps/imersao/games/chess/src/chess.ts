import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@ci/core';
import { Chess, Move } from 'chess.js';
const PIECE_VALUES: { [key: string]: number } = {
    p: 10,  // Peão
    n: 30,  // Cavalo
    b: 30,  // Bispo
    r: 50,  // Torre
    q: 90,  // Dama
    k: 900  // Rei
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
    private getHeuristicMove(moves: any[]): any {
        try {
            return moves.sort((a, b) => {
                const aValue = a.captured ? PIECE_VALUES[a.captured] : 0;
                const bValue = b.captured ? PIECE_VALUES[b.captured] : 0;
                return bValue - aValue; // Ordem decrescente de valor capturado
            })[0];
        } catch (error) {
            error;
            debugger;
        }
    }
    private getBestMoveMinimax(game: Chess, depth: number): any {
        let moves = game.moves({ verbose: true });
        let bestMove = null;
        let bestValue = -9999;
        for (let move of moves) {
            game.move(move);
            let boardValue = -this.minimax(game, depth - 1, false);
            game.undo();
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
        return bestMove;
    }
    private minimax(game: Chess, depth: number, isMaximizing: boolean): number {
        if (depth === 0) return this.evaluateBoard(game);
        let moves = game.moves();
        if (isMaximizing) {
            let best = -9999;
            for (let m of moves) {
                game.move(m);
                best = Math.max(best, this.minimax(game, depth - 1, !isMaximizing));
                game.undo();
            }
            return best;
        } else {
            let best = 9999;
            for (let m of moves) {
                game.move(m);
                best = Math.min(best, this.minimax(game, depth - 1, !isMaximizing));
                game.undo();
            }
            return best;
        }
    }
    private evaluateBoard(game: Chess): number {
        let totalEvaluation = 0;
        const board = game.board();

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece) {
                    const value = PIECE_VALUES[piece.type] || 0;
                    totalEvaluation += (piece.color === 'w' ? -value : value);
                }
            }
        }
        return totalEvaluation;
    }
    makeAIMove() {
        const possibilidades = this.game.moves({ verbose: true });
        let move: Move;
        if (possibilidades.length === 0) return;
        switch (this.difficulty) {
            case 'hard':
                move = this.getBestMoveMinimax(this.game, 3);
                break;
            case 'medium':
                move = this.getHeuristicMove(possibilidades);
                break;
            default:
                const randomIndex = Math.floor(Math.random() * possibilidades.length);
                move = possibilidades[randomIndex];
        }
        this.game.move(move);
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