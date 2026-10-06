import { KeyboardKey } from './KeyboardKey';

// Definição dos layouts pré-configurados
export const LAYOUT_PROGRAMMING: KeyboardKey[][] = [
    [
        { label: 'Esc', type: 'action', action: 'ESC', flex: 1.5 },
        { label: '{', type: 'char' }, { label: '}', type: 'char' },
        { label: '(', type: 'char' }, { label: ')', type: 'char' },
        { label: '<', type: 'char' }, { label: '>', type: 'char' },
        { label: '"', type: 'char' }, { label: "'", type: 'char' },
        { label: '_', type: 'char' },
        { label: '|', type: 'char' },
        { label: '?', type: 'char' },
        { label: '!', type: 'char' },
    ],
    [...['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='].map(k => ({ label: k, type: 'char' } as KeyboardKey))],
    [...['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '´', '['].map(k => ({ label: k, type: 'char' } as KeyboardKey))],
    [...['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', '~', ']'].map(k => ({ label: k, type: 'char' } as KeyboardKey))],
    [
        { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 },
        { label: '\\', type: 'char' },
        ...['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
        { label: '⌫', type: 'action', action: 'BACKSPACE', flex: 1.5 }
    ],
    [
        { label: 'Ctrl', type: 'modifier', action: 'CTRL', flex: 1.2 },
        { label: 'Tab', type: 'action', action: 'TAB', flex: 1.2 },
        { label: '@', type: 'char' },
        { label: 'Space', value: ' ', type: 'char', flex: 4 },
        { label: ';', type: 'char' },
        { label: '/', type: 'char' },
        { label: '↵', type: 'action', action: 'ENTER', flex: 1.5 }
    ]
];
