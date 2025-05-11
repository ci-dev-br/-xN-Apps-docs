export interface Option {
    label?: string;
    fieldName?: string;
}



export interface Type {
    name?: string;
    description?: string;
    hint?: string;
    options?: Option[];
    icon?: string;
}

export const TYPES: Type[] = [
    { name: 'text', description: 'Texto', icon: 'text' },
    { name: 'radio', description: 'Multipla escolha', icon: 'radio_button_checked' },
    { name: 'checkbox', description: 'Caixa de seleção', icon: 'check_box' },
    { name: 'list-select', description: 'Lista suspença', icon: 'task_alt' },
]