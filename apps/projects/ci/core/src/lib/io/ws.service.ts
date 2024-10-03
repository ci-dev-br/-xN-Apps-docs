import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Injectable()
export class WsService {
    globalPing?: number = 0;
    pingMedium?: number = 0;
    ping?: number = 0;
    status: 'connecting' | 'online' = 'connecting';
    private isBrowser: boolean = isPlatformBrowser(this.platformId);
    private retryWait = 100;
    private _grant_connection = false;
    private _subject?: WebSocketSubject<any>;
    get subject() {
        if (!this._subject) {
            this.init();
        }
        return this._subject;
    }
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        setTimeout(() => this.init());
    }
    async grantConnection() {
        this._grant_connection =
            true;
    }
    async init() {
        if (!this.isBrowser) return;
        if (this._subject) {
            this._subject.complete();
        }
        this._subject = webSocket('wss://apps.ci.dev.br:446');
        this._subject.subscribe(message => {
            this.status = 'online';
            this.retryWait = 100;
            this.ReceiveData(message)
        }, erros => {
            erros;
            console.error('erro', erros)
            if (erros instanceof CloseEvent || (erros instanceof Event && erros.type === 'error')) {
                if (this._subject) this._subject?.complete();
                this._subject = undefined;
                this.status = 'connecting';
                setTimeout(() => {
                    this.init();
                }, this.retryWait);
                this.retryWait = this.retryWait + 500;
            }
        }, () => {
            console.info('Fim')
        });
        this._subject.next({ event: 'events', data: { type: 'ping', momentum: (new Date().getTime()) } });
    }
    private async ReceiveData(data?: any) {
        if (data.type === 'pong') {
            this.ping = (new Date().getTime()) - Number(data.momentum);
            this.globalPing = data.globalPing;
            this.pingMedium = data.pingMedium;
            setTimeout(() => {
                this.Ping();
            }, data.wait);
        }
    }
    private Ping() {
        this.Emit({
            event: 'events',
            data: {
                type: 'ping',
                momentum: (new Date().getTime()),
                lastPing: this.ping,
            },
        });
    }
    Emit(payload: any) {
        this.subject?.next(payload);
    }
}