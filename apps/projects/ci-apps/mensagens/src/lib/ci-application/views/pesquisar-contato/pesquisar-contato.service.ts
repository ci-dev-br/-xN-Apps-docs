import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PesquisarContatoComponent } from "./pesquisar-contato.component";
import { lastValueFrom } from "rxjs";

@Injectable()
export class PesquisarService {
    constructor(
        private readonly dialog: MatDialog
    ) { }
    async pesquisarContato() {
        let contato = await lastValueFrom(this.dialog.open(PesquisarContatoComponent, {
            
        }).afterClosed());
    }
}