import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'ci-damas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './damas.html',
    styleUrls: ['./damas.scss']
})
export class DamasComponent implements OnInit {
    stage: 'init' | 'game' = 'init'
    board: any[] = [];
    selectedCell: any = null;
    turn: 'red' | 'black' = 'red';
    ngOnInit() {
        this.initBoard();
    }
    initBoard() {
        this.board = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = null;
                if ((r + c) % 2 !== 0) {
                    if (r < 3) piece = 'black';
                    if (r > 4) piece = 'red';
                }
                this.board.push({ row: r, col: c, piece, isKing: false });
            }
        }
        this.stage = 'game';
    }
    selectCell(cell: any) {
        // Selecionar peça do jogador atual
        if (cell.piece === this.turn) {
            this.selectedCell = cell;
            return;
        }
        // Tentar mover se uma peça estiver selecionada
        if (this.selectedCell && !cell.piece && (cell.row + cell.col) % 2 !== 0) {
            if (this.isValidMove(this.selectedCell, cell)) {
                this.movePiece(this.selectedCell, cell);
            }
        }
    }
    isValidMove(from: any, to: any): boolean {
        const rowDiff = to.row - from.row;
        const colDiff = Math.abs(to.col - from.col);
        // Movimento simples (1 casa)
        if (Math.abs(rowDiff) === 1 && colDiff === 1) {
            // Regra de direção (Damas simples não voltam, exceto reis)
            if (from.piece === 'red' && rowDiff > 0) return false;
            if (from.piece === 'black' && rowDiff < 0) return false;
            return true;
        }
        // Lógica de Captura (2 casas) - Simplificada
        if (Math.abs(rowDiff) === 2 && colDiff === 2) {
            const midRow = (from.row + to.row) / 2;
            const midCol = (from.col + to.col) / 2;
            const opponent = from.piece === 'red' ? 'black' : 'red';
            const midCell = this.board.find(c => c.row === midRow && c.col === midCol);
            if (midCell && midCell.piece === opponent) {
                midCell.piece = null; // Remove a peça capturada
                return true;
            }
        }
        return false;
    }
    movePiece(from: any, to: any) {
        to.piece = from.piece;
        from.piece = null;
        this.selectedCell = null;
        this.turn = this.turn === 'red' ? 'black' : 'red'; // Troca o turno
    }
}