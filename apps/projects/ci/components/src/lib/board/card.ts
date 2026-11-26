import { InjectionToken, Type } from "@angular/core";
import { Card, CardOption } from "@ci/portal-api";

export interface BoardCardDimensions {
    cols?: number; // 1, 2, 3, 4
    rows?: number; // 1, 2
    minHeight?: string;
}

export interface ImplCard extends Card {
    id?: string;
    componentName?: string | null;
    componentVersion?: string | null;
    settings?: { [key: string]: CardOption | null };
    componentRef: Type<any>;
    title?: string;
    descricao?: string;
    icon?: string;
    category?: string; // Ex: 'Financeiro', 'CRM', 'Comunicação', 'Utilitários', 'Geral', 'Conteúdo'
    tags?: string[];
    grupos?: string[];
    defaultInputs?: Record<string, any>;
    dimensions?: BoardCardDimensions;
    isPublic?: boolean;
    order?: number;
}

export const CardSetting = new InjectionToken<ImplCard[]>('CI__CARD_METAINFO');
