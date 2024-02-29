import { ComponentRef, Injectable, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MessageTemplateComponent } from "./message-template.component";

@Injectable()
export class MessageService {
    constructor(
        private readonly dialog: MatDialog
    ) { }
    async open() {
    }
    async confirm<T>(options: {
        template?: TemplateRef<T>,
        component?: ComponentRef<T>,
    }) {
        const component_base = options?.template ? MessageTemplateComponent : null;

        if (!component_base) return;
        let dialog = this.dialog.open(component_base, {
            data: {
                template: options.template
            }
        });
        dialog.afterClosed().subscribe()
        dialog.afterOpened().subscribe()
        dialog.backdropClick().subscribe()
        dialog.keydownEvents().subscribe()
    }
}