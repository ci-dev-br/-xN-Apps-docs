import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { TokenService } from '@ci/core';
import { WindowService } from '@ci/components';
// import { MatIcon } from '@angular/material/icon';
// import { IColumns } from '@ci/components';
export interface IItemAction<T> {
  label?: string;
  icon?: string;
  onAction?: (item: T) => void;
}
@Component({
  selector: 'ci-gerencial',
  templateUrl: './gerencial.component.html',
  styleUrls: ['./gerencial.component.scss']
})
export class GerencialComponent {
  constructor(
    private readonly dialog: MatDialog,
    // private readonly tokenS: TokenService,
    private readonly janela: WindowService,
  ) {
  }
  get token() {
    return null
    // return this.tokenS.Token;
  }
  conectarDispositivo() {
  }
}
