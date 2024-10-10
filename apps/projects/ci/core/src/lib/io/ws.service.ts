import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, SimpleChange, SimpleChanges } from "@angular/core";
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Injectable()
export class WsService {
    private clientIdentification = (Math.random() * 0x16 * Math.random() * 0x16 * Math.random() * 0x16).toString(32);
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
        this.Emit({ event: 'events', data: { type: 'ping', momentum: (new Date().getTime()) } });
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
        if (data.data.client === this.clientIdentification) return;
        if (data.event === 'Changes') {
            Object.keys(data.data.changes).forEach(p => {
                let o_DATA = this._atentionDatas.get(data.data.internalId);
                if (o_DATA)
                    o_DATA[p] = (data?.data?.changes[p]).currentValue;
            })

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
        const PAYLOAD_TO_SEND = { ...payload, };
        if (!PAYLOAD_TO_SEND.data) PAYLOAD_TO_SEND.data = {};
        PAYLOAD_TO_SEND.data.client = this.clientIdentification;
        PAYLOAD_TO_SEND.data.moment = Date.now();
        this.subject?.next(PAYLOAD_TO_SEND);
    }
    private _atentionDatas: Map<string, any> = new Map();
    /**
     * Solicitar atenção para um objeto. Mantém o objeto sincronizado com os demais clientes durante modificação.
     */
    async Atention(objectRef: any) {
        if (objectRef && !!objectRef.internalId) {
            this._atentionDatas.set(objectRef.internalId, objectRef);
            this.Emit({
                event: 'Atention',
                data: {
                    now: new Date(),
                    objectRef: {
                        ...objectRef,
                        internalId: objectRef.internalId,
                    }
                }
            });
        }
    }
    async EmitChanges(internalId: string, changes: SimpleChanges) {
        this.Emit({
            event: 'Changes',
            data: {
                internalId,
                changes,
            }
        })
    }
}