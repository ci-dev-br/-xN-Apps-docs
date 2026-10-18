import { KeyboardKey } from './KeyboardKey';

export const LAYOUT_SOCIAL: KeyboardKey[][] = [
    ['@', '#', '😂', '❤️', '👍', '🔥', '✨', '🎉'].map(k => ({ label: k, type: 'char' })),
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(k => ({ label: k, type: 'char' })),
    [
        ...['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
        { label: '⌫', type: 'action', action: 'BACKSPACE', flex: 1.5 }
    ],
    [
        { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 },
        ...['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
        { label: '↵', type: 'action', action: 'ENTER', flex: 1.5 }
    ],
    [
        { label: '_', type: 'char' }, { label: '&', type: 'char' },
        { label: 'Space', value: ' ', type: 'char', flex: 5 },
        { label: '.', type: 'char' }, { label: '?', type: 'char' }
    ]
];
