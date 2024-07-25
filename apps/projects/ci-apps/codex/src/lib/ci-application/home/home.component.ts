import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    CoreModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  abas?: { label: string, path: string, icon: string }[];
  constructor(
    private readonly route: ActivatedRoute,
    // private readonly dialog: MatDialog,
    // private readonly janela: WindowService,
  ) {

    this.abas = route.routeConfig?.children?.map(r => {
      return {
        label: (r?.data as any)?.title || r.path,
        path: '/' + r.path,
        icon: (r?.data as any)?.icon || undefined,
      } as { label: string, path: string, icon: string }
    }) || undefined;
  }
  items = [
    { titulo: "Criar novo Módulo" },
    { titulo: "Inspecionar Módulo" },
  ]
}
