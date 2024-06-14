import { Injectable, Injector, Type } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { WindowComponent } from "./window.component";
import { lastValueFrom } from "rxjs";

@Injectable()
export class WindowService {
    constructor(
        private readonly dialog: MatDialog,
    ) { }
    async open(component: Type<any>, data: any) {
        const dialog = await this.dialog.open(WindowComponent, {
            data: {
                component: component,
                data: data,
            },
        });
        if (dialog.componentRef?.instance) {
            dialog.componentRef.instance.component = component;
            //  dialog.componentRef.instance.title = 
        }
        return await lastValueFrom(dialog.afterClosed());
    }

}