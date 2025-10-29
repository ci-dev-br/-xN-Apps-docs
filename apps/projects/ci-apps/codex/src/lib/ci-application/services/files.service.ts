import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CodexCreatePainel } from "../create-painel/create-painel.component";

@Injectable()
export class Files {
    constructor(
        private readonly dialog: MatDialog,
    ) { }
    public openCreateNew() {
        this.dialog.open(CodexCreatePainel, {
            data: {

            }
        });
    }
}