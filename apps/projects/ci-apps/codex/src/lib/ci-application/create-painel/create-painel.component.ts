import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { CoreModule } from "@ci/core";

export interface ICodeType {
    description: string;
    icon?: string;
    actionHandler?: () => void;
}

@Component({
    selector: 'ci-codex-create-painel',
    template: `
    @if(options){@for (item of options; track $index) {<button mat-button (click)="item.actionHandler ? item.actionHandler() : undefined">
            {{item.description}}                 
        </button>}}`,
    standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
        MatDialogModule,
    ]
})
export class CodexCreatePainel {
    options?: ICodeType[] = [
        {
            description: 'Nova web function'
        }
    ];
    constructor() { }
}