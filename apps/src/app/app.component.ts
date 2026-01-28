import { Component, isDevMode, OnInit, Optional } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { WindowModule, WindowService } from '@ci/components';
import { CoreModule, CoreService, WsService } from '@ci/core';
@Component({
  selector: 'ci-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    MatIconModule,
    RouterModule,
    WindowModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isDevMode = isDevMode();
  title = 'apps';
  constructor(
    private readonly matIconReg: MatIconRegistry,
    private readonly core: CoreService,
    private readonly router: Router,
    private readonly ws: WsService,
    private readonly window: WindowService,
    private readonly snack?: MatSnackBar,
  ) {
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
  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-sharp');
    // this.router.events.subscribe(r => console.log(r))

    // This variable will save the event for later use.
    let deferredPrompt;
    if (typeof window !== 'undefined') {
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
      this.snack?.open(String(args),'Ok')
    })
    this.window?.addEventListener('error', (...args) => {
      this.snack?.open(String(args),'Ok')
    })
    this.window?.addEventListener('warn', (...args) => {
      this.snack?.open(String(args),'Ok')
    })
    this.window?.addEventListener('info', (...args) => {
      this.snack?.open(String(args),'Ok')
    })
  }
  private showInAppInstallPromotion() {
    alert("Instala ai tio");
  }
  private worker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register("https://apps.ci.dev.br/sw.js");
    }
  }
}
