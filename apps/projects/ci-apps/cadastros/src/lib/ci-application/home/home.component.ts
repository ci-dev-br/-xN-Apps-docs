import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
import { MenuService } from '../../menu-servive';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    CoreModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  abas?: { label: string, path: string, icon: string }[];
  constructor(
    private readonly route: ActivatedRoute,
    public readonly menus: MenuService,
  ) {

    this.abas = route.routeConfig?.children?.map(r => {
      return {
        label: (r?.data as any)?.title || r.path,
        path: '/' + r.path,
        icon: (r?.data as any)?.icon || undefined,
      } as { label: string, path: string, icon: string }
    }) || undefined;
  }
}
