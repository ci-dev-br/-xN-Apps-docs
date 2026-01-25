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
        return this.getNextMovie(fen);
    }
    private async getNextMovie(fen: string) {
        let game = new Chess(fen);
        let moves = game.moves({ verbose: true });
        let bad_moves = [];
        let good_moves = [];

        moves.forEach(move => {
            let x_game_adv = new Chess(move.after);
            let x_moves_adv = x_game_adv.moves({ verbose: true });
            let x_captured_adv = x_moves_adv.filter(m => m.captured);
            let x_promotion_adv = x_moves_adv.filter(m => m.promotion);

            (move as any).c_adv = x_captured_adv.length;
            (move as any).p_adv = x_promotion_adv.length;
            (move as any).ms_adv = x_moves_adv.length;

            if (x_promotion_adv.length > 0) {
                bad_moves.push(move);
            } else if (x_captured_adv.length > 0) {
                bad_moves.push(move);
            } else {
                good_moves.push(move);
            }
        });
        bad_moves.sort((a, b) => (a.ms_adv || 0) - (b.ms_adv || 0));
        bad_moves.sort((a, b) => (a.p_adv || 0) - (b.p_adv || 0));
        bad_moves.sort((a, b) => (a.c_adv || 0) - (b.c_adv || 0));

        good_moves.sort((a, b) => (a.ms_adv || 0) - (b.ms_adv || 0));
        good_moves.sort((a, b) => (a.p_adv || 0) - (b.p_adv || 0));
        good_moves.sort((a, b) => (a.c_adv || 0) - (b.c_adv || 0));

        let captured = moves.filter(move => move.captured && bad_moves.indexOf(move) === -1);
        let promotion = moves.filter(move => move.promotion && bad_moves.indexOf(move) === -1);

        if (promotion.length > 0) {
            promotion.sort((a, b) => PIECE_VALUES[b.promotion!] - PIECE_VALUES[a.promotion!]);
            return promotion[0];
        }
        if (captured.length > 0) {
            captured.sort((a, b) => PIECE_VALUES[b.captured!] - PIECE_VALUES[a.captured!]);
            return captured[0];
        }

        console.log('good', good_moves);
        console.log('bad', bad_moves);

        if (good_moves.length > 0)
            return good_moves[0];
        else if (bad_moves.length > 0)
            return bad_moves[0];
        else
            return null;
    }
}