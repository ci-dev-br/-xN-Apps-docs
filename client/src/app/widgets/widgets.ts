import { Type } from "@angular/core";
import { IFrameWidget, IFrameWidgetModule } from "./iframe/iframe.widget";

export interface IWidget {
    title?: string;
    description?: string;
    component?: Type<any>;
    module?: Type<any>;
}

export const Widgets: IWidget[] = [
    {
        title: "IFrame Widget", description: 'Página externa a partir de uma URL.',
        module: IFrameWidgetModule, component: IFrameWidget
    }
]