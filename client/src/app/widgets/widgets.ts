import { IFrameWidgetInfo } from "./iframe/iframe.widget";
import { CPUWidgetInfo } from "./cpu/cpu.widget";
import { TotalWidgetInfo } from "./total/total.widget";
import { IWidget } from "./i-widget";

export const Widgets: IWidget[] = [
    IFrameWidgetInfo,
    TotalWidgetInfo,
    CPUWidgetInfo,
]