import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'ci-message-template', template: `
    @if(data?.template){<ng-container *ngTemplateOutlet="data.template" ></ng-container>}
` })
export class MessageTemplateComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public readonly data?: any,
    ) { }
}