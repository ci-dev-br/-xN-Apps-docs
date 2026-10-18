import { KeyboardKey } from './KeyboardKey';

export const LAYOUT_PINPAD: KeyboardKey[][] = [
    ['1', '2', '3'].map(k => ({ label: k, type: 'char' })),
    ['4', '5', '6'].map(k => ({ label: k, type: 'char' })),
    ['7', '8', '9'].map(k => ({ label: k, type: 'char' })),
    ['BACKSPACE', '8', 'ENTER'].map(k => ({ label: k, type: 'action' })),
];
