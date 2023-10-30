import { Type } from "@angular/core";
import { IFrameWidget, IFrameWidgetModule } from "./iframe/iframe.widget";

export interface IWidget {
    title?: string;
    description?: string;
    tags?: string[];
    component?: Type<any>;
    module?: Type<any>;
}

export const Widgets: IWidget[] = [
    {
        title: "IFrame Widget",
        tags: [],
        description: 'Página externa a partir de uma URL.',
        module: IFrameWidgetModule, component: IFrameWidget
    },
]