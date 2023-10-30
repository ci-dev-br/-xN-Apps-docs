import { Type } from "@angular/core";
import { IFrameWidget, IFrameWidgetModule } from "./iframe/iframe.widget";

export interface IControl {
    type?: string;
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
            url: { type: 'text' }
        },
        module: IFrameWidgetModule, component: IFrameWidget
    },
]