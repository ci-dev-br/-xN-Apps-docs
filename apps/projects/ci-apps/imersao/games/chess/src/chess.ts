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
        this.camera.position.z = 12; // Câmera recuada para ver o tabuleiro todo
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0); // Apontar para o centro do tabuleiro
        this.updateBoard();
    }
    toggleRenderMode() {
        this.renderMode = this.renderMode === '2d' ? '3d' : '2d';
        if (this.renderMode === '3d') {
            setTimeout(() => this.updatePosition(), 100);
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

        // Os seus logs mostram que o tabuleiro é composto por malhas chamadas "Cube_1", "Cube_2", etc.
        const nome = event.meshName.toLowerCase();
        const isBoard = nome.includes('board') || nome.includes('cube');

        if (!isBoard) {
            // Se for peça, usa o centro global dela (WorldPos)
            file = Math.round((event.objectPosition.x / step) + 3.5);
            rank = Math.round((event.objectPosition.z / step) + 3.5);
        } else {
            // Se for o tabuleiro, usa o ponto exato onde a luz do rato bateu
            file = Math.round((event.point.x / step) + 3.5);
            rank = Math.round((event.point.z / step) + 3.5);
        }

        // Apenas para confirmar no F12 que a ligação foi feita com sucesso
        console.log(`[🎯 Lógica Xadrez] Convertido para Linha: ${rank}, Coluna: ${file}`);

        // Garante que o clique não saiu das bordas do tabuleiro 8x8
        if (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
            // Dispara o método original do jogo 2D!
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
            setTimeout(() => this.updatePosition(), 600);
        }
    }
    updateBoard() {
        this.board = this.game.board();
        if (this.renderMode === '3d') {
            this.updatePosition();
        }
    }
    updatePosition() {
        if (!this.objetos || !this.objetos[0]?.gltf?.scene) return;
        let scene = this.objetos[0].gltf.scene;
        // Estrutura para agrupar os meshes 3D livres por tipo e cor
        const availableMeshes: any = {
            w: { p: [], n: [], b: [], r: [], q: [], k: [] },
            b: { p: [], n: [], b: [], r: [], q: [], k: [] }
        };
        // Classificar as peças 3D
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
                availableMeshes[color][type].push(mesh);
                mesh.visible = false; // Esconder temporariamente até usar
            }
        });
        // Distância exata deduzida dos limites min/max do seu GLB (-6.04 a 5.96)
        const step = 1.714;
        // Iterar pelo tabuleiro lógico (0-7 linhas/ranks, 0-7 colunas/files)
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece) {
                    // Pega um mesh compatível e posiciona na coordenada
                    const meshToPlace = availableMeshes[piece.color][piece.type].pop();
                    if (meshToPlace) {
                        meshToPlace.visible = true;
                        // Mapeando a grade 8x8 para as medidas 3D
                        meshToPlace.position.x = (c - 3.5) * step;
                        meshToPlace.position.z = (r - 3.5) * step;
                        // o 'y' nós mantemos como está no arquivo (altura correta da peça)
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
            // Tenta realizar o movimento
            this.criarMovimento(this.selectedSquare, coords);
            // Limpa a seleção tanto na lógica (2D) quanto no 3D
            this.selectedSquare = null;
            this.th?.setHighlight(null, null);
        } else {
            const piece = this.game.get(coords as any);
            // Verifica se clicou numa peça e se é a vez dela
            if (piece && piece.color === this.game.turn()) {
                this.selectedSquare = coords;
                // Ativa o highlight visual na casa em 3D
                this.th?.setHighlight(rank, file);
            }
        }
    }
    criarMovimento(from: string, to: string) {
        try {
            const movimento = this.game.move({ from, to, promotion: 'q' });
            if (movimento) {
                this.updateBoard(); // Isto vai atualizar o 3D também
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
            // Fallback se a API falhar
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