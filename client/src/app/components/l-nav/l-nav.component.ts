import { Component } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, ActivationStart, ChildActivationEnd, Router } from '@angular/router';
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
  title?: string;
  breadcrumb?: IBreadcrumb[];
  $user = this.userService.user;
  constructor(
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
    private readonly router: Router,
  ) {
    this.load();
    router.events.subscribe((event: any) => {
      if (
        (
          event instanceof ActivationEnd ||
          event instanceof ChildActivationEnd
        )

        && event && event.snapshot instanceof ActivatedRouteSnapshot &&
        event?.snapshot?.data) {
        const data: { name?: string } = event.snapshot.data;
        if (data && 'name' in data) {
          if (!this.breadcrumb) this.breadcrumb = [];
          if (!!this.breadcrumb.find(b => b.name === data.name)) return;
          this.breadcrumb = [{
            name: data.name
          }, ...this.breadcrumb];
          this.title = data.name;
        }
      }
    })
  }
  load() {
    (async () => { this.apps = await lastValueFrom(this.applicationService.get()) })();
  }
  sair() {
    this.userService.sair();
  }
}
