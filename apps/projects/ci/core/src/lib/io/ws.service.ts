import { isPlatformBrowser } from "@angular/common";
import { EventEmitter, Inject, Injectable, PLATFORM_ID, SimpleChange, SimpleChanges } from "@angular/core";
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
        let gateway_api = location.origin.replace('http', 'ws').replace(':4200', ':86');
        this._subject = webSocket(gateway_api);
        this._subject.subscribe(message => {
            this.status = 'online';
            this.retryWait = 100;
            this.ReceiveData(message)
        }, erros => {
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
    listner = new Map<string, Array<any>>();
    addMessageListner(name: string, call: (data?: any) => void) {
        if (!this.listner.has(name))
            this.listner.set(name, [call])
        else
            this.listner.get(name)?.push(call)
    }
    emit(name: string, message: any) {
        if (this.listner.has(name))
            this.listner.get(name)?.forEach(callBack => {
                try {
                    callBack(message);
                } catch (error) {
                }
            });
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
        if (data.data?.client === this.clientIdentification) return;
        if (data.event === 'Changes') {
            Object.keys(data.data.changes).forEach(p => {
                let o_DATA = this._atentionDatas.get(data.data.internalId);
                if (o_DATA &&
                    (o_DATA[p] === (data?.data?.changes[p] as SimpleChange).previousValue
                        ||
                        (o_DATA[p] || '').length < ((data?.data?.changes[p] as SimpleChange).previousValue || '').length
                    ) &&
                    data.setOrigem !== this.clientIdentification
                ) o_DATA[p] = (data?.data?.changes[p]).currentValue;
            })
        }
        if (data.event && typeof data.data === 'object') {
            this.emit(data.event,
                { ...data.data }
            )
        }
    }
    /**
     * Aciona evento de ping-pong no socket para medição de latência de sincrinização de dados on-line
     * 
     */
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
    /**
     * Assina evento no canal socket aberto.
     */
    public async AddEventListener(
        /**
         * Nome do Evento
         */
        eventName: string,
        data?: any,
        /**
         * Opções adicionais do comportamento da assinatura 
         */
        options?: {
            /**
             * | Nome do Evento | Descrição |
             * | --- | --- | 
             * | replay | recebe a lista de todos os eventos disparados desde o começo |
             * | loop-back | assina o evento e propaga o consumo da mensagem confirmando leitura |
             * | sign | assina o evento e propaga o consumo da mensagem |
             * 
             * 
             */
            type?: 'replay' | 'loop-back' | 'sign',
            /**
             * Delay no disparo do evento na recepção
             */
            delay?: number,
        }
    ) {
        this.Emit({
            event: 'listening',
            data: {
                __type: options?.type || 'default',
                name: eventName,
                ...data
            },
        });
    }
    /**
     * Emite mensagem para o websocket auto-assinada pela aplicação cliente
     * @param payload 
     */
    Emit(payload: any) {
        const { toJSON, toString, __constructor__, ...INNER_CONTENT_DATA } = payload;
        const PAYLOAD_TO_SEND = { ...INNER_CONTENT_DATA, };
        if (!PAYLOAD_TO_SEND.data) PAYLOAD_TO_SEND.data = {};
        PAYLOAD_TO_SEND.data.client = this.clientIdentification;
        PAYLOAD_TO_SEND.data.moment = Date.now();
        if (!PAYLOAD_TO_SEND.data['setOrigem']) PAYLOAD_TO_SEND.data['setOrigem'] = this.clientIdentification;
        this.subject?.next(PAYLOAD_TO_SEND);
    }
    private _atentionDatas: Map<string, any> = new Map();
    /**
     * Solicitar atenção para um objeto. Mantém o objeto sincronizado com os demais clientes 
     * durante modificação. Recebendo retorno dos clientes que estão consumindo os eventos da 
     * aplicação.
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
                        id: objectRef.id,
                    }
                }
            });
        }
    }
    /**
     * Emite as mudanças de um objeto a partir do padrão SimpleChanges do Angular
     * 
     * @param internalId 
     * @param changes 
     */
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