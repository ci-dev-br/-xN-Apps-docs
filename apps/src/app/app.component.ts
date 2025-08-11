import { Component, OnInit, Optional } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CoreModule, CoreService, WsService } from '@ci/core';
@Component({
  selector: 'ci-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'apps';
  constructor(
    private readonly matIconReg: MatIconRegistry,
    private readonly core: CoreService,
    private readonly router: Router,
    private readonly ws: WsService,
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
  }
  private showInAppInstallPromotion() {
    alert("Instala ai tio")
  }
  private worker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register("https://srv33.internals.ci.dev.br:664/sw.js");
    }
  }
}
