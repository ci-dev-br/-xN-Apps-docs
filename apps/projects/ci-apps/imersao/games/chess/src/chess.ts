import { Component, ComponentRef, ElementRef, OnInit, Optional, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@ci/core';
import { Objeto, ThreeClickEvent, ThrejsComponent } from '@ci/espazio';
import { ChessService, GameplayService } from '@ci/portal-api';
import { Chess, Move } from 'chess.js';
import { lastValueFrom } from 'rxjs';
import { PerspectiveCamera } from 'three';
const PIECE_VALUES: { [key: string]: number } = {
    p: 10 * 2.1, n: 30 * 2.2, b: 30 * 2.3, r: 50 * 2.4, q: 90 * 3.5, k: 900 * 2
};
@Component({
    selector: 'ci-chess-game',
    standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        ThrejsComponent,
    ],
    templateUrl: './chess.html',
    styleUrls: ['./chess.scss']
})
export class ChessGameComponent implements OnInit {
    renderMode: '3d' | '2d' = '3d';
    @ViewChild('rendererContainer', { static: false }) rendererContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('th', { static: false }) th?: ThrejsComponent;
    objetos: Objeto[] = [
        new Objeto({ glb_file: 'chess_c001.glb' }),
    ];
    stage: 'menu' | 'play' | 'viewer' = 'menu';
    player: 'white' | 'black' = 'white';
    game = new Chess();
    camera = new PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    board: any[][] = [];
    selectedSquare: string | null = null;
    isVsIA = false;
    gameplay?: any;
    constructor(
        private readonly gameplays: GameplayService,
        private chess: ChessService,
        @Optional() private readonly er: ElementRef<any>,
        @Optional() private readonly cr: ComponentRef<any>
    ) { }
    ngOnInit() {
        this.camera.position.z = 12;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0);
        this.updateBoard();
    }
    toggleRenderMode() {
        this.renderMode = this.renderMode === '2d' ? '3d' : '2d';
        if (this.renderMode === '3d') {
            setTimeout(() => this.updateBoard3D(), 100);
        }
    }
    start() {
        this.isVsIA = false;
        this.resetGame();
    }
    handle3DClick(event: ThreeClickEvent) {
        if (this.game.isGameOver()) return;
        if (this.isVsIA && this.game.turn() === 'b') return;
        const step = 1.714;
        let file: number, rank: number;
        const nome = event.meshName.toLowerCase();
        const isBoard = nome.includes('board') || nome.includes('cube');
        if (!isBoard) {
            file = Math.round((event.objectPosition.x / step) + 3.5);
            rank = Math.round((event.objectPosition.z / step) + 3.5);
        } else {
            file = Math.round((event.point.x / step) + 3.5);
            rank = Math.round((event.point.z / step) + 3.5);
        }
        console.log(`[🎯 Lógica Xadrez] Convertido para Linha: ${rank}, Coluna: ${file}`);
        if (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
            this.onSquareClick(rank, file);
        } else {
            this.selectedSquare = null;
            this.th?.setHighlight(null, null);
        }
    }
    async startVsIA() {
        this.gameplay = (await lastValueFrom(this.gameplays.createNew({})));
        this.isVsIA = true;
        this.resetGame();
    }
    private resetGame() {
        this.stage = 'play';
        this.game.reset();
        this.updateBoard();
        if (this.renderMode === '3d') {
            setTimeout(() => this.updateBoard3D(), 600);
        }
    }
    updateBoard() {
        this.board = this.game.board();
        if (this.renderMode === '3d') {
            this.updateBoard3D();
        }
    }
    // Método dedicado para sincronizar a posição das peças com o Path Tracer
    private updateBoard3D() {
        if (!this.th) return;
        // 1. Prepara o Path Tracer para a mudança (limpa o rastro fantasma)
        this.th.iniciarAnimacaoMovimento();
        // 2. Move fisicamente as malhas 3D
        this.updatePosition();
        // 3. Informa o Path Tracer que a movimentação acabou para ele gerar o BVH no novo local
        this.th.finalizarAnimacaoMovimento();
    }
    updatePosition() {
        if (!this.objetos || !this.objetos[0]?.gltf?.scene) return;
        let scene = this.objetos[0].gltf.scene;

        const availableMeshes: any = {
            w: { p: [], n: [], b: [], r: [], q: [], k: [] },
            b: { p: [], n: [], b: [], r: [], q: [], k: [] }
        };

        scene.children.forEach((mesh: any) => {
            const name = mesh.name.toLowerCase();
            if (name.includes('board') || name.includes('camera') || name.includes('sun')) return;

            const color = name.includes('light') ? 'w' : (name.includes('dark') ? 'b' : null);
            if (!color) return;

            let type = '';
            if (name.includes('pawn')) type = 'p';
            else if (name.includes('knight')) type = 'n';
            else if (name.includes('bishop')) type = 'b';
            else if (name.includes('rock') || name.includes('rook')) type = 'r';
            else if (name.includes('queen')) type = 'q';
            else if (name.includes('king')) type = 'k';

            if (type) {
                // 1. Salva a altura original da peça na primeira vez que passar por ela
                if (mesh.userData.originalY === undefined) {
                    mesh.userData.originalY = mesh.position.y;
                }

                availableMeshes[color][type].push(mesh);

                // 2. O SEGREDO: Garante que NENHUMA peça fica invisível. 
                // Apenas teleportamos as que sobram para um "cemitério" embaixo do tabuleiro
                mesh.visible = true;
                mesh.position.y = -100;
                mesh.updateMatrixWorld(true);
            }
        });

        const step = 1.714;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece) {
                    const meshToPlace = availableMeshes[piece.color][piece.type].pop();
                    if (meshToPlace) {
                        // 3. Traz a peça do cemitério para a posição correta
                        meshToPlace.position.x = (c - 3.5) * step;
                        meshToPlace.position.y = meshToPlace.userData.originalY; // Restaura a altura original
                        meshToPlace.position.z = (r - 3.5) * step;

                        // Força o recalculo da posição na matriz global IMEDIATAMENTE
                        meshToPlace.updateMatrixWorld(true);
                    }
                }
            }
        }
    }
    onSquareClick(rank: number, file: number) {
        if (this.game.isGameOver()) return;
        if (this.isVsIA && this.game.turn() === 'b') return;
        const coords = this.getCoords(rank, file);
        if (this.selectedSquare) {
            this.criarMovimento(this.selectedSquare, coords);
            this.selectedSquare = null;
            this.th?.setHighlight(null, null);
        } else {
            const piece = this.game.get(coords as any);
            if (piece && piece.color === this.game.turn()) {
                this.selectedSquare = coords;
                this.th?.setHighlight(rank, file);
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
            console.log("Movimento inválido", e);
        }
    }
    async makeAIMove() {
        const possibilidades = this.game.moves({ verbose: true });
        if (possibilidades.length === 0) return;
        let moviment = undefined;
        try {
            let reaction = await lastValueFrom(this.chess.chessMove({ body: { fen: this.game.fen() } }));
            if ('move' in reaction) moviment = reaction.move as any;
        } catch (error) {
            console.trace(error);
        }
        if (moviment) {
            this.game.move(moviment);
        } else {
            this.game.move(possibilidades[Math.floor(Math.random() * possibilidades.length)]);
        }
        this.updateBoard();
        this.checkGameStatus();
    }
    getCoords(rank: number, file: number): string {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return files[file] + (8 - rank);
    }
    checkGameStatus() {
        if (this.game.isGameOver()) {
            if (this.game.isCheckmate()) {
                const winner = this.game.turn() === 'w' ? 'Black' : 'White';
                alert(`Checkmate! ${winner} wins!`);
            } else if (this.game.isDraw()) {
                alert('Game over! It\'s a draw.');
            } else {
                alert('Game over!');
            }
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
        try {
            let jogada = await lastValueFrom(this.chess.chessMove({ body: { fen: this.game.fen() } }));
            if (jogada?.move) {
                this.game.move(jogada.move as any);
                this.updateBoard();
                this.checkGameStatus();
            }
        } catch (e) {
            console.log("Falha ao buscar dica");
        }
    }
    desistir() {
        alert('Você desistiu da partida!');
        this.stage = 'menu';
    }
}