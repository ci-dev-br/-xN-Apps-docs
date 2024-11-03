import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class MensagensService {
  constructor(
    dialog: MatDialog,
  ) { }
}
