import { EventEmitter, Injectable, Optional, Type } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { WindowComponent } from "./window.component";

export interface ConsoleEvent {
    type?: 'log' | 'info' | 'warn' | 'error';
    args?: any | any[];
}

@Injectable()
export class WindowService {
    /*  private static _logger_origin: any;
     private static emitter = new EventEmitter<ConsoleEvent>();
     private static setup() {
         if (!!WindowService._logger_origin) return;
         WindowService._logger_origin = {
             log: console.log,
             info: console.info,
             warn: console.warn,
             error: console.error,
         };
         console.log = (...args: any[]) => {
             this.emitter.emit({
                 type: 'log', args
             })
             setTimeout(() => {
                 WindowService._logger_origin.log(...args);
             })
         }
         console.info = (...args: any[]) => {
             this.emitter.emit({
                 type: 'info', args
             })
             setTimeout(() => {
                 WindowService._logger_origin.info(...args);
             })
         }
         console.warn = (...args: any[]) => {
             this.emitter.emit({
                 type: 'warn', args
             })
             setTimeout(() => {
                 WindowService._logger_origin.warn(...args);
             })
         }
         console.error = (...args: any[]) => {
             this.emitter.emit({
                 type: 'error', args
             })
             setTimeout(() => {
                 WindowService._logger_origin.error(...args);
             })
         }
     } */
    constructor(
        @Optional() private readonly dialog?: MatDialog,
        // @Optional() private readonly daos?: DaoService,
    ) {
        /* setTimeout(() => {
            WindowService.setup();
        }); */
    }
    async open(component: Type<any>, data: any, title?: string, event?: Event): Promise<any> {
        return await new Promise<any>(async (result, reject) => {
            try {
                if (event instanceof MouseEvent && event?.ctrlKey) {
                    /* event.preventDefault();
                    setTimeout(() => {
                        window.open(location.href, 'PopupWindow' + (data?.internalId || data?.id || data?.data?.internalId || data?.data?.id || ''), "width=600,height=700,resizable=yes,top=100,left=200,");
                    }) */
                } else {
                    const dialog = await this.dialog?.open(WindowComponent, {
                        data: {
                            component: component,
                            data: data
                        },
                        maxWidth: '90vw',
                    });
                    if (dialog && dialog.componentInstance) {
                        dialog.componentInstance.title = title;
                        if (dialog.componentRef?.instance) {
                            dialog.componentRef.instance.component = component;
                            dialog.componentRef.instance.title = title
                        }
                        dialog.afterClosed().subscribe((r: any) => {
                            result(r);
                        })
                        //  return await lastValueFrom(dialog.afterClosed());
                    }
                }
            } catch (error) {
                console.trace(error);
                reject(error);
            }
        });
    }
    public addEventListener(eventName: string, callback: (...args: any[]) => void) {
        /* return WindowService.emitter.subscribe(event => {
            event.type === eventName ? callback(...event.args) : undefined
        }) */
    }
}