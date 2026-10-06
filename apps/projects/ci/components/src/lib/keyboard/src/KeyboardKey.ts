export interface KeyboardKey {
    label: string;
    value?: string;
    type: 'char' | 'action' | 'modifier';
    action?: string;
    flex?: number;
}
