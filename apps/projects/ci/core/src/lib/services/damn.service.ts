import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
/**
 * Deny Application for the bad-guy
 */
@Injectable()
export class Damn {
    constructor(
        // @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // this.trackApplication();
    }
    /**
     * Destroy application in runtime
     */
    async inert() {
        //  if (!isPlatformBrowser(this.platformId)) return;
        // const ______35481618______ = globalThis.setTimeout;
        // const ______25694738______ = globalThis.console.log;
        // const ______25469783______ = globalThis.console.error;
        // const ______23647048______ = globalThis.console.clear;
        // document.head.innerHTML = '';
        // document.body.innerHTML = '';
        // Object.keys(globalThis).forEach(k => {
        //     ______35481618______(() => delete (globalThis as any)[k]);
        // })
        // delete (globalThis as any).Zone;
        // console.error = () => {
        //     while (1 === 1) {
        //         ______23647048______();
        //         ______25694738______('[Damn!]');
        //     }
        // }
        // while (1 === 1) {
        //     ______23647048______();
        //     ______25694738______('[DAN!]');
        // }
    }
    private emitEvent(isOpen: boolean, orientation: boolean) {
        //  globalThis.dispatchEvent(new globalThis.CustomEvent('devtoolschange', {
        //      detail: {
        //          isOpen,
        //          orientation,
        //      },
        //  }));
    };
    private trackApplication() {
        //  if (!isPlatformBrowser(this.platformId)) return;
        //  // Revisar bloqueio
        //  const _128974: any = globalThis.eval;
        //  (globalThis as any).eval = (...args: any[]) => {
        //      if (!isPlatformBrowser(this.platformId)) return;
        //      console.log('...');
        //      return _128974(...args);
        //  }
        //  this.verify();
        // window.onresize = (event: UIEvent) => {
        //     if (!isPlatformBrowser(this.platformId)) return;
        //     event = event;
        //     if (event.target instanceof Window) {
        //         const rect = event.target.document.body.getBoundingClientRect()
        //         if (event.target.screen.width - 10 > rect.width ||
        //             event.target.screen.height - 10 > rect.height
        //         ) {
        //             this.inert();
        //         }
        //     }
        // }
    }
    private verify() {
        // TODO: resolver implementação. Esta quebrando compilação de produção.
        /* if (!isPlatformBrowser(this.platformId)) return;
        let consoleIsOpen = false;
        let consoleOpened = false;
        const threshold = 250;
        const verify = () => {
            if (!isPlatformBrowser(this.platformId)) return;
            const widthThreshold = globalThis.outerWidth - globalThis.innerWidth > threshold;
            const heightThreshold = globalThis.outerHeight - globalThis.innerHeight > threshold;
            if (widthThreshold || heightThreshold) {
                console.log('OPEN!');
                this.inert();
            }
            if (consoleIsOpen === false && consoleOpened === true) {
                window.dispatchEvent(new Event('devtools-opened'));
                consoleOpened = false;
            } else if (consoleIsOpen === true && consoleOpened === false) {
                window.dispatchEvent(new Event('devtools-closed'));
                consoleOpened = true;
            }
            consoleIsOpen = false;
            setTimeout(() => verify(), 300);
        }
        verify(); */
    }
}