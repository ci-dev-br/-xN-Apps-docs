import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, SimpleChange, SimpleChanges } from "@angular/core";
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

/**
 * Serviço de comunicação via WebSocket com o gateway
 */
@Injectable()
export class WsService {
    private __clientAutoIdentification = (Math.random() * 0x16 * Math.random() * 0x16 * Math.random() * 0x16).toString(32);
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
    /**
     *  Inicia o canal WebSocket de comunicação com o gateway
     * @returns 
     */
    async init() {
        if (!this.isBrowser) return;
        if (this._subject) {
            this._subject.complete();
        }
        let gateway_api = 'wss://apps.ci.dev.br' /* location.origin.replace('http', 'ws').replace(':4200', ':86'); */
        this._subject = webSocket(gateway_api);
        this._subject.subscribe(message => {
            this.status = 'online';
            this.retryWait = 100;
            this.ReceiveDataHandler(message)
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
            console.info('{{Fim do canal de comunicação WebSocket}}');
        });
        this.Emit({ event: 'events', data: { type: 'ping', momento: (new Date().getTime()) } });
    }
    listeners = new Map<string, Array<any>>();
    /**
     * Adiciona listener local para eventos recebidos via WebSocket
     * @param name 
     * @param call 
     */
    addMessageListener(name: string, call: (data?: any) => void) {
        if (!this.listeners.has(name))
            this.listeners.set(name, [call])
        else
            this.listeners.get(name)?.push(call)
    }
    /**
     * Escuta evento nomeado e dispara função de chamada sempre que o evento ocorrer.
     * @param name 
     * @param call 
     */
    addEventListener(name: string, call: (data?: any) => void) {
        this.Emit({
            event: 'events',
            data: {
                type: name,
            },
        });
        this.addMessageListener(name + '.Response', call);
    }
    /**
     * Dispara evento localmente para os listeners cadastrados
     * @param name 
     * @param message 
     */
    emit(name: string, message: any) {
        if (this.listeners.has(message.type || name))
            this.listeners.get(message.type || name)?.forEach(callBack => {
                try {
                    callBack(message);
                } catch (error) {
                    console.error(error);
                }
            });
    }
    /**
     * Recepção de dados via Socket 
     * @param data 
     * @returns 
     */
    private async ReceiveDataHandler(data?: any) {
        if (data.type === 'pong') {
            this.ping = (new Date().getTime()) - Number(data.momento);
            this.globalPing = data.globalPing;
            this.pingMedium = data.pingMedium;
            setTimeout(() => {
                this.Ping();
            }, data.wait);
        }
        if (data.data?.client === this.__clientAutoIdentification) return;
        if (data.event === 'Changes') {
            Object.keys(data.data.changes).forEach(changed_property_name => {
                let o_DATA = this._attentionDatas.get(data.data.internalId);
                if (o_DATA &&
                    (
                        // o_DATA[changed_property_name] === (data?.data?.changes[changed_property_name] as SimpleChange).previousValue ||
                        (o_DATA[changed_property_name] || '').length < ((data?.data?.changes[changed_property_name] as SimpleChange).previousValue || '').length
                    ) &&
                    data.setOrigem !== this.__clientAutoIdentification
                ) {
                    this._updating.add(o_DATA);
                    try {
                        o_DATA[changed_property_name] = (data?.data?.changes[changed_property_name]).currentValue;
                    } catch (error) {
                        console.error(error);
                    }
                    this._updating.delete(o_DATA);
                }
            })
        }
        if (data.event && typeof data.data === 'object') {
            this.emit(data.event,
                {
                    ...data,
                }
            )
        }
    }
    private _updating: Set<any> = new Set();
    /**
     * Aciona evento de ping-pong no socket para medição de latência de sincrinização de dados on-line
     * 
     */
    private Ping() {
        this.Emit({
            event: 'events',
            data: {
                type: 'ping',
                momento: (new Date().getTime()),
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
        PAYLOAD_TO_SEND.data.client = this.__clientAutoIdentification;
        PAYLOAD_TO_SEND.data.momento = Date.now();
        if (!PAYLOAD_TO_SEND.data['setOrigem']) PAYLOAD_TO_SEND.data['setOrigem'] = this.__clientAutoIdentification;
        this.subject?.next(PAYLOAD_TO_SEND);
    }
    private _attentionDatas: Map<string, any> = new Map();
    /**
     * Solicitar atenção para um objeto. Mantém o objeto sincronizado com os demais clientes 
     * durante modificação. Recebendo retorno dos clientes que estão consumindo os eventos da 
     * aplicação.
     */
    async Attention(objectRef: any) {
        if (objectRef && !!objectRef.internalId) {
            this._attentionDatas.set(objectRef.internalId, objectRef);
            this.Emit({
                event: 'Attention',
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
    async EmitChanges(internalId: string, changes: SimpleChanges, objectRef?: any) {
        if (objectRef && this._updating.has(objectRef)) return;
        this.Emit({
            event: 'Changes',
            data: {
                internalId,
                changes,
            }
        })
    }
}