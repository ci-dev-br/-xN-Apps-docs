import { Injectable, Injector, Optional, Type } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { WindowComponent } from "./window.component";
import { lastValueFrom } from "rxjs";

@Injectable()
export class WindowService {
    constructor(
        @Optional() private readonly dialog?: MatDialog,
    ) { }
    async open(component: Type<any>, data: any, title?: string, event?: Event) {
        if (event instanceof MouseEvent && event?.ctrlKey) {
            event.preventDefault();
            setTimeout(() => {
                window.open(location.href, 'PopupWindow' + (data?.internalId || data?.id || data?.data?.internalId || data?.data?.id || ''), "width=600,height=700,resizable=yes,top=100,left=200,");
            })
        } else {
            const dialog = await this.dialog?.open(WindowComponent, {
                data: {
                    component: component,
                    data: data,
                    // ctrlKey: event?.ctrlKey
                },
                maxWidth: '90vw',
            });
            if (dialog) {
                dialog.componentInstance.title = title;
                if (dialog.componentRef?.instance) {
                    dialog.componentRef.instance.component = component;
                    //  dialog.componentRef.instance.title = 
                }
                return await lastValueFrom(dialog.afterClosed());
            }
        }
    }

}