import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotaComponent } from './nota.component';

@Injectable()
export class NotaService {
  constructor(
    private dialog: MatDialog,
  ) { }
  async novaNota() {
    this.dialog.open(NotaComponent);
  }
}
