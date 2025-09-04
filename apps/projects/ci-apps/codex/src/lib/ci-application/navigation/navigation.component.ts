import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
import { OpenProjectComponent } from '../open-project/open-project.component';
import { Files } from '../services/files.service';

export interface IMenu {
  items: IMenuItem[];
}

export interface IMenuItem {
  label: string;
  icon?: string;
  action?: () => void;
}

@Component({
  selector: 'ci-navigation',
  standalone: true,
  imports: [
    CoreModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  menuBar?: IMenu;
  abas?: { label: string, path: string, icon: string }[];
  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    protected readonly files: Files,
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
  openProject() {
    this.dialog.open(OpenProjectComponent, {
      data: {}
    })
  }
}
