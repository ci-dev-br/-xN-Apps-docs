export interface CiInputOption {
    label?: string;
    fieldName?: string;
}
export interface CyInputType {
    name?: string;
    description?: string;
    hint?: string;
    options?: CiInputOption[];
    icon?: string;
}
export const CI_INPUT_TYPES: CyInputType[] = [
    { name: 'text', description: 'Texto', icon: 'text' },
    { name: 'number', description: 'Número', icon: 'numeric' },
    { name: 'number', description: 'Valor', icon: 'numeric' },
    { name: 'radio', description: 'Multipla escolha', icon: 'radio_button_checked' },
    { name: 'checkbox', description: 'Caixa de seleção', icon: 'check_box' },
    { name: 'list-select', description: 'Lista suspença', icon: 'task_alt' },
]