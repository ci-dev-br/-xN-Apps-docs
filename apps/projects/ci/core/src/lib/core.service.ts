import { Injectable, Injector, Optional } from '@angular/core';
import { DAN } from './services/dan.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ThemeService } from './core.module';
@Injectable()
export class CoreService {
  constructor(
    inject: Injector,
    @Optional() private readonly router: Router,
    @Optional() private readonly ar: ActivatedRoute,
    @Optional() private readonly themeService?: ThemeService,
  ) {
    if (!!router) // setTimeout(() =>
      this.initRouterFixings()
    // );
    setTimeout(() => inject.get(DAN));
  }
  async initRouterFixings() {
    let navigation_start: string | undefined = undefined;
    let u = this.router.events.subscribe(next => {
      if (next instanceof NavigationStart && !navigation_start) navigation_start = next.url;
      if (next instanceof NavigationEnd) setTimeout(() => {
        if (next.url !== navigation_start) {
          try {
            this.router.navigate([navigation_start]); u.unsubscribe()
          } catch (error) {
            ///  this.router.navigate(['/']); u.unsubscribe()
          }
        }
      }, 0)
    })
  }
}
