import { Component, OnDestroy, Optional } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UserAuthenticationService } from '@ci/auth';
import { WindowService } from '@ci/components/window';
import { Subscription } from 'rxjs';
export interface IItemAction<T> {
  label?: string;
  icon?: string;
  onAction?: (item: T) => void;
}
@Component({
  selector: 'ci-gerencial',
  templateUrl: './gerencial.component.html',
  styleUrls: ['./gerencial.component.scss'],
  standalone: false
})
export class GerencialComponent implements OnDestroy {
  tabs?: { label: string, path: string, icon: string }[];
  private userSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly janela: WindowService,
    @Optional() private readonly userAuth?: UserAuthenticationService,
  ) {
    this.buildTabs(this.userAuth?.user?.value?.roles || []);
    this.userSub = this.userAuth?.user?.subscribe(user => {
      this.buildTabs(user?.roles || []);
    });
  }

  private buildTabs(userRoles: string[]) {
    const normalizedRoles = (userRoles || []).map(r => (r || '').toUpperCase());
    const children = this.route.routeConfig?.children || [];
    this.tabs = children
      .filter(r => {
        const routeRoles: string[] | undefined = (r?.data as any)?.roles;
        if (!Array.isArray(routeRoles) || routeRoles.length === 0 || normalizedRoles.length === 0) {
          return true;
        }
        return routeRoles.some(role => normalizedRoles.includes(role.toUpperCase()));
      })
      .map(r => ({
        label: (r?.data as any)?.title || r.path || '',
        path: r.path || '',
        icon: (r?.data as any)?.icon || undefined,
      }));
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  conectarDispositivo() {
  }
}
