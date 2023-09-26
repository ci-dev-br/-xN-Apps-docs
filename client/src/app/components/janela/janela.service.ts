import { Injectable, Type } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { JanelaComponent } from "./janela.component";

@Injectable()
export class JanelaService {
    constructor(
        private readonly dialog: MatDialog,
    ) { }
    async open(component: Type<any>) {
        const dialog = await this.dialog.open(JanelaComponent, {
            data: {
                component: component
            }
        });

        if (dialog.componentRef?.instance) {
            dialog.componentRef.instance.component = component;
        }
    }
}