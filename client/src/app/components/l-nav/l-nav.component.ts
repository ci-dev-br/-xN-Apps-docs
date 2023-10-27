import { Component } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, ActivationStart, ChildActivationEnd, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { lastValueFrom } from 'rxjs';
import { Application } from 'src/app/api/models';
import { ApplicationService } from 'src/app/api/services';
import { HttpClient } from '@angular/common/http';
import { ServicesService } from 'src/app/core/services/services.service';

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
  icon?: string;
  title?: string;
  breadcrumb?: IBreadcrumb[];
  $user = this.userService.user;
  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
    private readonly http: HttpClient,
    public readonly services: ServicesService,
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
        const data: { name?: string, icon?: string } = event.snapshot.data;
        if (data && 'name' in data) {
          if (!this.breadcrumb) this.breadcrumb = [];

          if (data.name) this.title = data.name;
          if (data.icon) this.icon = data.icon;

          if (!!this.breadcrumb.find(b => b.name === data.name)) return;
          this.breadcrumb = [{
            name: data.name
          }, ...this.breadcrumb];
        }
      }
    })
  }
  load() {
    (async () => {
      try {
        this.apps = await lastValueFrom(this.applicationService.get())
      } catch (error) {
        console.error(error);
      }
    })();
    this.loadStatus();
  }
  sair() {
    this.userService.sair();
  }
  status_services: any = {};
  loadStatus() {
    this.http.get('http://localhost:7684/json').subscribe(v => {
      this.status_services = v;
    });
    setTimeout(() => this.loadStatus(), 10000);
  }
}
