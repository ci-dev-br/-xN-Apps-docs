/**
 * Metadados de mini documentação dispostos na rota de cada aplicação.
 * Exibidos na primeira execução após ativação na Loja e disponíveis sob demanda.
 */
export interface IAppDocumentation {
    appKey?: string;
    title: string;
    summary: string;
    category?: string;
    icon?: string;
    features?: string[];
    quickStart?: string[];
    version?: string;
    badge?: string;
    tips?: string[];
}
