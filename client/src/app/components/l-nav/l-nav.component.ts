import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { lastValueFrom } from 'rxjs';
import { Application } from 'src/app/api/models';
import { ApplicationService } from 'src/app/api/services';

interface IBreadcrumb {
  name?: string;
}


@Component({
  selector: 'ci-l-nav',
  templateUrl: './l-nav.component.html',
  styleUrls: ['./l-nav.component.scss']
})
export class LNavComponent {
  apps?: Application[];
  breadcrumb?: IBreadcrumb[];
  $user = this.userService.user;
  constructor(
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
    private readonly router: Router,
  ) {
    this.load();
    router.events.subscribe(event => {
      console.log(event);
    })
  }
  load() {
    (async () => { this.apps = await lastValueFrom(this.applicationService.get()) })();
  }
  sair() {
    this.userService.sair();
  }
}
