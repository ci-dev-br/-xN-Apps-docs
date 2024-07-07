import { Component } from '@angular/core';
import { CoreModule, StorageService } from '@ci/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { APPS } from './apps/apps';
import { AuthModule, UserService } from '@ci/auth';
import { LogoComponent } from '@ci/components';
@Component({
  selector: 'ci-painel',
  standalone: true,
  imports: [
    CoreModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSidenavModule,
    RouterModule,
    AuthModule,
    MatTooltipModule,
    LogoComponent,
  ],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent {
  apps?: any[] = APPS;
  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
  ) { }

  async appClickHandler(event: MouseEvent, app: any) {
    if (event.ctrlKey) {
      window.open(location.href + '/' + app.url, '')
    } else {
      this.router.navigate(['/' + app.url], { relativeTo: this.route.root });
    }
  }

  async sair() {
    this.userService.sair();
    // setTimeout(() =>
    //   this.router.navigate(['/'])
    // );
  }
}
