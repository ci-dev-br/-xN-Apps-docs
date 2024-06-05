import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TokenService } from 'src/app/core/token.service';
import { WindowService } from 'src/app/components/window/window.service';
// import { MatIcon } from '@angular/material/icon';
// import { IColumns } from 'src/app/components/grid/cell-renderer/cell-renderer.component';
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
    private readonly tokenS: TokenService,
    private readonly janela: WindowService,
  ) {
  }
  get token() {
    return this.tokenS.Token;
  }
  conectarDispositivo() {
  }
}
