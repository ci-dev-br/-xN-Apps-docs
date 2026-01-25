import { Injectable } from "@nestjs/common";
import { Chess } from "chess.js";
const PIECE_VALUES: { [key: string]: number } = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
};
@Injectable()
export class ChessService {
    constructor() { }
    async getMoveByFen(fen: string) {
        return this.getRandomMovie(fen, 3);
    }
    private async getRandomMovie(fen: string, depth: number) {
        let game = new Chess(fen);
        let moves = game.moves({ verbose: true });
        return moves[Math.ceil(Math.random() * moves.length)];
    }
}