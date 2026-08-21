import { Injectable, Optional } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NotificationService } from './notification/notification.service';
import { Apps } from './apps/apps.service';
@Injectable()
export class CoreService {
  constructor(
    @Optional() private readonly apps?: Apps,
    @Optional() private readonly router?: Router,
    @Optional() private readonly notification?: NotificationService,
    //  @Optional() inject: Injector,
    // @Optional() private readonly ar?: ActivatedRoute,
    // @Optional() private readonly themeService?: ThemeService,
    // @Optional() private readonly contextMenu?: ContextMenuServices,
    // @Optional() private readonly ws?: WsService,
  ) { }
  /**
   * 
   * para que serve este trecho? qual era a intenção inicial?
   */
  async initRouterFixings() {
    let navigation_start: string | undefined = undefined;
    let u = this.router?.events.subscribe(next => {
      if (next instanceof NavigationStart && !navigation_start) navigation_start = next.url;
      if (next instanceof NavigationEnd) setTimeout(() => {
        if (next.url !== navigation_start) {
          try {
            if (navigation_start !== '/') {
              /// this.router?.navigate([navigation_start]); u?.unsubscribe();
            }
          } catch (error) {
            ///  this.router.navigate(['/']); u.unsubscribe()
          }
        }
      }, 0)
    })
  }
  init() {
    try {
      if (!!this.router) this.initRouterFixings()
      //  setTimeout(() => inject.get(Damn));
    } catch (error) {
      console.info('[0xf1]');
    }
    /*  try {
       this.notification?.requestPermission();
     } catch (error) {
       console.info('[0xf2]');
     } */
  }
}
