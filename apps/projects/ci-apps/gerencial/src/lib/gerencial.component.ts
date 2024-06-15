import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
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
  abas?: { label: string, path: string, icon: string }[];
  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly janela: WindowService,
  ) {
    this.abas = route.routeConfig?.children?.map(r => {
      return {
        label: (r?.data as any)?.title || r.path,
        path: r.path,
        icon: (r?.data as any)?.icon || undefined,
      } as { label: string, path: string, icon: string }
    }) || undefined;
  }
  conectarDispositivo() {
  }
}
