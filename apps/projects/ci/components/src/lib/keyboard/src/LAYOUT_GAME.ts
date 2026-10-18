import { KeyboardKey } from './KeyboardKey';

export const LAYOUT_GAME: KeyboardKey[][] = [
    [
        { label: 'Esc', type: 'action', action: 'ESC' },
        ...['1', '2', '3', '4', '5'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
        { label: 'M', type: 'char' }, { label: 'I', type: 'char' }
    ],
    [
        { label: 'Tab', type: 'action', action: 'TAB', flex: 1.5 },
        ...['Q', 'W', 'E', 'R', 'T', 'Y'].map(k => ({ label: k, value: k.toLowerCase(), type: 'char' } as KeyboardKey))
    ],
    [
        { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 },
        ...['A', 'S', 'D', 'F', 'G', 'H'].map(k => ({ label: k, value: k.toLowerCase(), type: 'char' } as KeyboardKey))
    ],
    [
        { label: 'Ctrl', type: 'modifier', action: 'CTRL', flex: 1.5 },
        ...['Z', 'X', 'C', 'V', 'B'].map(k => ({ label: k, value: k.toLowerCase(), type: 'char' } as KeyboardKey)),
        { label: 'Space', value: ' ', type: 'char', flex: 3 }
    ]
];
