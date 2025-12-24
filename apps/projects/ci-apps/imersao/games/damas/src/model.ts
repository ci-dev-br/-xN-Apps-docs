export type Player = 'red' | 'black';
export interface Cell {
    row: number;
    col: number;
    piece: Player | null;
    isKing: boolean;
}