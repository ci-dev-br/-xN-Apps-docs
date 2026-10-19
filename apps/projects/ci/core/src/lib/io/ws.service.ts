import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, Optional, PLATFORM_ID, SimpleChange, SimpleChanges } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

import { StorageService } from "../storage/storage.service";

/**
 * Serviço de comunicação via WebSocket com o gateway
 */
@Injectable()
export class WsService {
    private __clientAutoIdentification = (Math.random() * 0x16 * Math.random() * 0x16 * Math.random() * 0x16).toString(32);
    globalPing?: number = 0;
    pingMedium?: number = 0;
    ping?: number = 0;
    get status(): 'connecting' | 'online' | 'closed' {
        return this.status$.value;
    }
    set status(value: 'connecting' | 'online' | 'closed') {
        console.log(value)
        this.status$.next(value);
    }
    public status$: BehaviorSubject<'connecting' | 'online' | 'closed'> = new BehaviorSubject<'connecting' | 'online' | 'closed'>('connecting');
    public deviceStatus$: BehaviorSubject<{ chaveAcesso: string; isOnline: boolean; timestamp?: number } | null> =
        new BehaviorSubject<{ chaveAcesso: string; isOnline: boolean; timestamp?: number } | null>(null);
    public sessionRevoked$: BehaviorSubject<{ chaveAcesso: string; message?: string } | null> =
        new BehaviorSubject<{ chaveAcesso: string; message?: string } | null>(null);

    private isBrowser: boolean = isPlatformBrowser(this.platformId);
    private retryWait = 100;
    private _grant_connection = false;
    private websocket_subject?: WebSocketSubject<any>;
    get subject() {
        if (!this.websocket_subject) {
            this.init();
        }
        return this.websocket_subject;
    }
    constructor(
        @Optional() @Inject(PLATFORM_ID) private platformId: Object,
        @Optional() private readonly storage?: StorageService,
    ) {
        setTimeout(() => this.init());
    }
    async grantConnection() {
        this._grant_connection =
            true;
    }

    private extractChaveAcessoFromToken(token?: string | null): string | undefined {
        if (!token || typeof token !== 'string') return undefined;
        const clean = token.replace(/^Bearer\s+/i, '').trim();
        const parts = clean.split('.');
        if (parts.length === 3) {
            try {
                const base64Url = parts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload?.chaveAcesso) return payload.chaveAcesso;
            } catch {
                try {
                    const payload = JSON.parse(atob(parts[1]));
                    if (payload?.chaveAcesso) return payload.chaveAcesso;
                } catch {}
            }
        }
        return undefined;
    }

    public getStoredChaveAcesso(): string | undefined {
        if (!this.isBrowser || typeof localStorage === 'undefined') return undefined;
        try {
            if (this.storage) {
                const userStore: any = this.storage.restore('apps.ci.dev.br.store.User');
                const bearer = userStore?.authentication?.bearer || userStore?.bearer;
                const chave = this.extractChaveAcessoFromToken(bearer);
                if (chave) return chave;
                if (userStore?.authentication?.chaveAcesso) return userStore.authentication.chaveAcesso;
                if (userStore?.chaveAcesso) return userStore.chaveAcesso;
            }
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;
                const val = localStorage.getItem(key);
                if (!val) continue;
                try {
                    const decoded = atob(val);
                    if (decoded.includes('bearer') || decoded.includes('chaveAcesso')) {
                        const parsed = JSON.parse(decoded);
                        const bearer = parsed?.authentication?.bearer || parsed?.bearer;
                        const chave = this.extractChaveAcessoFromToken(bearer) || parsed?.authentication?.chaveAcesso || parsed?.chaveAcesso;
                        if (chave) return chave;
                    }
                } catch {}
            }
        } catch {}
        return undefined;
    }

    public identifySession(chaveAcesso?: string) {
        const chave = chaveAcesso || this.getStoredChaveAcesso();
        if (chave) {
            this.Emit({
                event: 'events',
                data: {
                    type: 'Identification',
                    chaveAcesso: chave,
                    momento: Date.now()
                }
            });
        }
    }

    /**
     *  Inicia o canal WebSocket de comunicação com o gateway
     * @returns 
     */
    async init() {
        if (!this.isBrowser) return;
        if (this.websocket_subject) {
            this.websocket_subject.complete();
        }
        let gateway_api = 'wss://apps.ci.dev.br';

        this.status = 'connecting';
        this.websocket_subject = webSocket({
            url: gateway_api,
            openObserver: {
                next: () => {
                    console.log(`[WsService] Conexão WebSocket estabelecida com ${gateway_api}`);
                    this.status = 'online';
                    this.retryWait = 100;
                    const chaveAcesso = this.getStoredChaveAcesso();
                    this.Emit({
                        event: 'events',
                        data: {
                            type: 'Wake',
                            momento: Date.now(),
                            chaveAcesso
                        }
                    });
                }
            },
            closeObserver: {
                next: () => {
                    console.warn(`[WsService] Conexão WebSocket com ${gateway_api} encerrada.`);
                    this.status = 'closed';
                }
            }
        });

        this.websocket_subject.subscribe({
            next: (message) => {
                this.status = 'online';
                this.retryWait = 100;
                this.ReceiveDataHandler(message);
            },
            error: (erros) => {
                console.error(`[WsService] Erro na conexão WebSocket (${gateway_api}):`, erros);
                this.status = 'connecting';
                if (erros instanceof CloseEvent || (erros instanceof Event && erros.type === 'error')) {
                    if (this.websocket_subject) this.websocket_subject?.complete();
                    this.websocket_subject = undefined;
                    setTimeout(() => {
                        this.init();
                    }, this.retryWait);
                    this.retryWait = Math.min(this.retryWait + 500, 10000);
                }
            },
            complete: () => {
                this.status = 'closed';
            }
        });
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
                    console.trace(error);
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
                        console.trace(error);
                    }
                    this._updating.delete(o_DATA);
                }
            });
        }
        if (data.event === 'DeviceStatus' && data.data) {
            this.deviceStatus$.next(data.data);
        }
        if (data.event === 'SessionRevoked' && data.data) {
            this.sessionRevoked$.next(data.data);
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
        /*  this.Emit({
             event: 'events',
             data: {
                 type: 'ping',
                 momento: (new Date().getTime()),
                 lastPing: this.ping,
             },
         }); */
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
     * Remove propriedades internas (`_`, `:`) e referências cíclicas antes de serializar no WebSocket.
     */
    private sanitizePayload(value: any, visited = new WeakSet<object>()): any {
        if (value === null || value === undefined || typeof value !== 'object') {
            return value;
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value.subscribe === 'function') {
            return undefined;
        }
        if (visited.has(value)) {
            return undefined;
        }
        visited.add(value);
        if (Array.isArray(value)) {
            return value
                .filter(item => !item || typeof item.subscribe !== 'function')
                .map(item => this.sanitizePayload(item, visited));
        }
        const clean: Record<string, any> = {};
        for (const key of Object.keys(value)) {
            if (key.startsWith('::') || key === '__confirmation_subject' || key === '__pre' || key === '__binding_form' || key === '__readed' || key === 'toJSON' || key === 'toString' || key === '__constructor__') {
                continue;
            }
            const propVal = value[key];
            if (typeof propVal === 'function' || (propVal && typeof propVal.subscribe === 'function')) {
                continue;
            }
            clean[key] = this.sanitizePayload(propVal, visited);
        }
        return clean;
    }

    /**
     * Emite mensagem para o websocket auto-assinada pela aplicação cliente
     * @param payload 
     */
    Emit(payload: any) {
        const { toJSON, toString, __constructor__, ...INNER_CONTENT_DATA } = payload || {};
        const PAYLOAD_TO_SEND = this.sanitizePayload({ ...INNER_CONTENT_DATA }) || {};
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
    async Propagar(objectRef: any) {
        if (objectRef && !!objectRef.internalId) {
            this._attentionDatas.set(objectRef.internalId, objectRef);
            const cleanRef = this.sanitizePayload(objectRef);
            this.Emit({
                event: 'Attention',
                data: {
                    now: new Date(),
                    objectRef: {
                        ...cleanRef,
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