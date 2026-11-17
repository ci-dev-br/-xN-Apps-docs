import { Type } from '@angular/core';

export type BlockInputType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'select'
    | 'json'
    | 'color'
    | 'textarea';

export interface BlockComponentInputOption {
    label: string;
    value: any;
}

export interface BlockComponentInputSchema {
    name: string;
    label?: string;
    type: BlockInputType;
    defaultValue?: any;
    required?: boolean;
    description?: string;
    options?: BlockComponentInputOption[];
}

export interface DynamicComponentDefinition {
    /** Identificador único do componente */
    name: string;
    /** Título exibido na paleta */
    title: string;
    /** Descrição curta do componente */
    description?: string;
    /** Ícone Material */
    icon?: string;
    /** Categoria na paleta */
    category?: string;
    /** Referência opcional de componente Angular para renderização dinâmica */
    componentRef?: Type<any>;
    /** Lista de inputs configuráveis aceitos pelo componente */
    inputs: BlockComponentInputSchema[];
    /** Indica se o bloco pode conter blocos filhos */
    allowChildren?: boolean;
}

export interface DynamicBlockNode {
    id: string;
    componentName: string;
    label?: string;
    inputs?: Record<string, any>;
    children?: DynamicBlockNode[];
    order?: number;
}

export interface DynamicBlockSpecification {
    version: string;
    name: string;
    route?: string;
    layout?: 'vertical' | 'horizontal' | 'grid' | string;
    blocks?: DynamicBlockNode[];
    metadata?: Record<string, any>;
}
