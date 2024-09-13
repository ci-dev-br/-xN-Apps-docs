import { Injectable } from "@angular/core";
/**
 * Deny Application for the bad-guy
 */
@Injectable()
export class Damn {
    constructor() {
        this.trackApplication();
    }
    /**
     * Destroy application in runtime
     */
    async inert() {
        const ______35481618______ = globalThis.setTimeout;
        const ______25694738______ = globalThis.console.log;
        const ______25469783______ = globalThis.console.error;
        const ______23647048______ = globalThis.console.clear;
        Object.keys(globalThis).forEach(k => {
            ______35481618______(() => delete (globalThis as any)[k]);
        })
        delete (globalThis as any).Zone;
        console.error = () => {
            while (1 === 1) {
                ______23647048______();
                ______25694738______('[DAN!]');
            }
        }
        /*  while (1 === 1) {
             ______23647048______();
             ______25694738______('[DAN!]');
         } */
    }

    /* private emitEvent(isOpen: boolean, orientation: boolean) {
        globalThis.dispatchEvent(new globalThis.CustomEvent('devtoolschange', {
            detail: {
                isOpen,
                orientation,
            },
        }));
    }; */

    private trackApplication() {
        // const _128974: any = globalThis.eval;
        // (globalThis as any).eval = (...args: any[]) => {
        //     // console.log('...');
        //     return _128974(...args);
        // }
        // this.verify();
        // window.onresize = (event: UIEvent) => {
        //     event = event;
        //     if (event.target instanceof Window) {
        //         const rect = event.target.document.body.getBoundingClientRect()
        //         if (event.target.screen.width - 10 > rect.width ||
        //             event.target.screen.height - 10 > rect.height
        //         ) {
        //             //  this.inert();
        //         }
        //     }
        // }
    }
    private verify() {
        // const el = new Image();
        // let consoleIsOpen = false;
        // let consoleOpened = false;
        // Object.defineProperty(el, 'id', {
        //     get: () => {
        //         consoleIsOpen = true;
        //     }
        // });
        const threshold = 170;
        const verify = () => {
            // const widthThreshold = globalThis.outerWidth - globalThis.innerWidth > threshold;
            // const heightThreshold = globalThis.outerHeight - globalThis.innerHeight > threshold;
            // 
            // if (widthThreshold || heightThreshold) {
            //     console.log('OPEEN!')
            // }

            // console.dir(el);
            // if (consoleIsOpen === false && consoleOpened === true) {
            //     // console closed
            //     window.dispatchEvent(new Event('devtools-opened'));
            //     consoleOpened = false;
            // } else if (consoleIsOpen === true && consoleOpened === false) {
            //     // console opened
            //     window.dispatchEvent(new Event('devtools-closed'));
            //     consoleOpened = true;
            // }
            // consoleIsOpen = false;
            // setTimeout(verify, 300);
        }
        verify();
    }
}