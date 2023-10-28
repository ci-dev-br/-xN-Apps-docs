import { Injectable, NgZone } from "@angular/core";

@Injectable()
export class ServicesService {
    constructor(
    ) {
        window.addEventListener('resize', () => {
            if (
                (window.innerWidth + 150) < window.outerWidth ||
                (window.innerHeight + 150) < window.outerHeight
            ) {
                const d = document;
                document.children.item(0)?.remove();
                localStorage.clear();
                sessionStorage.clear();
                [...Object.keys(document)].forEach(e => {
                    try {
                        delete (document as any)[e];
                    } catch (error) {

                    }
                });
                [...Object.keys(window)].forEach(e => {
                    try {
                        delete (window as any)[e];
                    } catch (error) {

                    }
                });
                try {
                    console.log = () => { }
                    console.info = () => { }
                    console.error = () => { }
                    window.eval = () => { }

                    console.clear();
                    console.clear = () => { }

                    console.warn('ACESSO NEGADO...');
                    console.warn = () => { }
                } catch (error) {
                }
                d.close();
            }
        })
    }
    compartilhar() {

    }

}