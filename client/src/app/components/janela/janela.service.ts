import { Injectable, Injector, Type } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { JanelaComponent } from "./janela.component";
import { lastValueFrom } from "rxjs";

@Injectable()
export class JanelaService {
    constructor(
        private readonly dialog: MatDialog,
    ) { }
    async open(component: Type<any>, data: any) {
        const dialog = await this.dialog.open(JanelaComponent, {
            data: {
                component: component,
                data: data,
            },
        });
        if (dialog.componentRef?.instance) {
            dialog.componentRef.instance.component = component;
        }
        return await lastValueFrom(dialog.afterClosed());
    }

}