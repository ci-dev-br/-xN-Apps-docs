import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
import { APPS } from './apps';
import { AuthModule, UserService } from '@ci/auth';

@Component({
  selector: 'ci-apps',
  standalone: true,
  imports: [
    CoreModule,
    MatIconModule,
    RouterModule,
    AuthModule,
  ],
  providers: [
    /*  {
       provide: CI_ICON_PACK, useValue: {
         agenda: { url: 'icons/agenda.svg' }
       }, multi: true
     } */
  ],
  templateUrl: './apps.component.html',
  styleUrl: './apps.component.scss'
})
export class AppsComponent implements OnInit {
  apps?: any[];
  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }
  async ngOnInit() {
    this.userService.user.subscribe(user => {
      if (!!user) {
        this.apps = APPS.filter(app => !!this.userService && !!this.userService.user && !!this.userService.user.value ?
          this.userService.user?.value?.roles?.find(role => app.roles.indexOf(role) > -1) : false);
      } else {
        // this.router.navigate(['/']);
      }
    })
  }
  async appClickHandler(event: MouseEvent, app: any) {
    if (event.ctrlKey) {
      window.open(location.href + '/' + app.url, '')
    } else {
      this.router.navigate([app.url], {/*  relativeTo: this.route */ });
    }
  }
}
