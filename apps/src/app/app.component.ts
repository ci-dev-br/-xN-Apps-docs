import { Component, createNgModule, HostListener, Inject, Injector, isDevMode, OnDestroy, OnInit, Optional } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Route, Router, RouterModule, RouterOutlet, ROUTES } from '@angular/router';
import { ProfileMenu, USER_MENU } from '@ci/auth';
import { IItemMenu, WindowModule, WindowService } from '@ci/components/window';
import { CoreModule, CoreService, MenuService, WsService } from '@ci/core';
import { ApplicationService } from '@ci/portal-api';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { AssistenteComponent } from './assistente/assistente';

@Component({
  selector: 'ci-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    MatIconModule,
    RouterModule,
    WindowModule,
    MatSnackBarModule,
    AssistenteComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  load = new BehaviorSubject<boolean>(true);
  isDevMode = isDevMode();
  title = 'apps';
  status$;
  constructor(
    protected readonly ws: WsService,
    @Optional() private readonly matIconReg?: MatIconRegistry,
    @Optional() private readonly core?: CoreService,
    // @Optional() private readonly router: Router, 
    // // TODO: mover controle ativo de rota para camapra Core Init;
    // @Optional() private readonly websocket: WsService,
    //  // TODO: mover Web websocket para Core Init;
    @Optional() private readonly window?: WindowService,
    @Optional() private readonly snack?: MatSnackBar,
    @Optional() @Inject(USER_MENU) private readonly userMenu?: IItemMenu[],
    private readonly menuService?: MenuService,
  ) {
    this.status$ = ws.status$;
    if (!!menuService && userMenu) menuService.userMenu.next(userMenu);
    // This variable will save the event for later use.
    // let deferredPrompt;
    /* window.addEventListener('beforeinstallprompt', (e) => {
      // Prevents the default mini-infobar or install dialog from appearing on mobile
      // e.preventDefault();
      // Save the event because you'll need to trigger it later.
      // deferredPrompt = e;
      // Show your customized install prompt for your PWA
      // Your own UI doesn't have to be a single element, you
      // can have buttons in different locations, or wait to prompt
      // as part of a critical journey.
      // showInAppInstallPromotion();
    }); */
  }
  ngOnDestroy(): void {
  }
  ngOnInit() {
    // this.preparePreloadedApplication();
    this.core?.init();
    this.matIconReg?.setDefaultFontSetClass('material-symbols-sharp');
    // this.router.events.subscribe(r => console.log(r))
    // This variable will save the event for later use.
    let deferredPrompt;
    if (typeof window !== 'undefined') {
      this.load.next(false);
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Prevents the default mini-infobar or install dialog from appearing on mobile
        // Save the event because you'll need to trigger it later.
        // Show your customized install prompt for your PWA
        // Your own UI doesn't have to be a single element, you
        // can have buttons in different locations, or wait to prompt
        // as part of a critical journey.
        // showInAppInstallPromotion();
      });
    }
    // this.worker();
    this.window?.addEventListener('log', (...args) => {
      this.snack?.open(String(args), 'Visto')
    })
    this.window?.addEventListener('error', (...args) => {
      this.snack?.open(String(args), 'Visto')
    })
    this.window?.addEventListener('warn', (...args) => {
      this.snack?.open(String(args), 'Visto')
    })
    this.window?.addEventListener('info', (...args) => {
      this.snack?.open(String(args), 'Visto')
    })
  }
  private showInAppInstallPromotion() {
    alert("Gostando da experiência? Instale o aplicativo no seu dispositivo!");
  }
  private worker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register("https://apps.ci.dev.br/sw.js");
    }
  }
  @HostListener('window:keydown', ['$event'])
  keyDownHandler(event: KeyboardEvent) {
    // disabled user force reload page ... 
    if (event.code === 'F5' || (event.code === 'KeyR' && event.ctrlKey)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
