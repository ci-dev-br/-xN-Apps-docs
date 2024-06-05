import { IWidget } from "./i-widget";

/** =Imports */
import { IFrameWidgetInfo } from "./iframe/iframe.widget";
import { CPUWidgetInfo } from "./cpu/cpu.widget";
import { TotalWidgetInfo } from "./total/total.widget";
import { ComponentWidgetInfo } from "./component/component.widget";
/** */

export const Widgets: IWidget[] = [
    /** =Widgets */
    IFrameWidgetInfo,
    TotalWidgetInfo,
    CPUWidgetInfo,
    ComponentWidgetInfo,
    /** */
]