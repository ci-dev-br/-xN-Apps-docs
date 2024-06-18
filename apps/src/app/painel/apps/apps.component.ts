import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
import { Application } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { APPS } from './apps';

@Component({
  selector: 'ci-apps',
  standalone: true,
  imports: [
    CoreModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './apps.component.html',
  styleUrl: './apps.component.scss'
})
export class AppsComponent {
  apps?: any[] = APPS;
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }


  async appClickHandler(event: MouseEvent, app: any) {
    if (event.ctrlKey) {
      window.open(location.href + '/' + app.url, '')
    } else {
      this.router.navigate([app.url], {/*  relativeTo: this.route */ });
    }
  }
}
