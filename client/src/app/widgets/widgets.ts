import { Type } from "@angular/core";
import { IFrameWidget, IFrameWidgetModule } from "./iframe/iframe.widget";

export interface IControl {
    type?: string;
    label?: string;
    maxLength?: number;
    getValue?: () => number;
}

export interface IWidget {
    title?: string;
    description?: string;
    tags?: string[];
    component?: Type<any>;
    module?: Type<any>;
    settings?: { [control: string]: IControl };
}

export const Widgets: IWidget[] = [
    {
        title: "IFrame Widget",
        description: 'Página externa a partir de uma URL.',
        tags: ['Elementos'],
        settings: {
            url: { type: 'text', maxLength: 500 }
        },
        module: IFrameWidgetModule, component: IFrameWidget
    },
    {
        title: "Total",
        description: 'Visualizar valor Total.',
        tags: ['Valores'],
        settings: {
            value: { type: 'text', label: "Valor total" }
        },
        module: IFrameWidgetModule, component: IFrameWidget
    },
]