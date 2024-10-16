import { Injectable, Injector, Optional } from '@angular/core';
import { Damn } from './services/damn.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ThemeService, WsService } from './core.module';
import { NotificationService } from './notification/notification.service';
import { ContextMenuServices } from './contextmenu/contextmenu.service';
@Injectable()
export class CoreService {
  constructor(
    inject: Injector,
    @Optional() private readonly router?: Router,
    @Optional() private readonly ar?: ActivatedRoute,
    @Optional() private readonly themeService?: ThemeService,
    @Optional() private readonly notification?: NotificationService,
    @Optional() private readonly contextMenu?: ContextMenuServices,
    @Optional() private readonly ws?: WsService,
  ) {
    if (!!router) this.initRouterFixings()
    setTimeout(() => inject.get(Damn));
    notification?.requestPermission();
  }
  async initRouterFixings() {
    let navigation_start: string | undefined = undefined;
    let u = this.router?.events.subscribe(next => {
      if (next instanceof NavigationStart && !navigation_start) navigation_start = next.url;
      if (next instanceof NavigationEnd) setTimeout(() => {
        if (next.url !== navigation_start) {
          try {
            this.router?.navigate([navigation_start]); u?.unsubscribe();
          } catch (error) {
            ///  this.router.navigate(['/']); u.unsubscribe()
          }
        }
      }, 0)
    })
  }
}
