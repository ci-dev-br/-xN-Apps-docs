import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CodexCreatePainel } from "../create-painel/create-painel.component";
import { Router } from "@angular/router";
import { IArquivo } from "@ci-apps/Arquivos";

@Injectable()
export class Files {
    constructor(
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) { }
    public openCreateNew() {
        this.dialog.open(CodexCreatePainel, {
            data: {

            }
        });
    }
    public async openFile(file: IArquivo) {
        this.router.navigate(['Codex', 'editor'], {
            queryParams: {
                file: (file?.info?.path! || '')
            }
        })
    }
}