import { InjectionToken, Type } from "@angular/core";
import { Card, CardOption } from "@ci/portal-api";
export interface ImplCard extends Card {
    componentName?: string | null;
    componentVersion?: string | null;
    settings?: CardOption | null;
    componentRef: Type<any>;
    title?: string;
    descricao?: string;
    tags?: string[];
    grupos?: string[];
}
export const CardSetting = new InjectionToken<ImplCard[]>('CI__CARD_METAINFO');