import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { createHash } from "crypto";
import { Server } from "ws";
import { BusService } from "./bus.service";
import { Socket } from "socket.io";
import { ReplaySubject } from "rxjs";
import { IDataMessage } from "./dtos/i-data-message";
/**
 * Gateway de eventos via WebSocket
 */
@WebSocketGateway(
    {
        transports: [
            'websocket'
        ],
        cors: [
            '*'
        ],
    })
export class EventsGateway implements OnGatewayInit {
    constructor(
        private readonly bus: BusService,
    ) {
        bus.events = this;
    }
    /**
     *  Handler de ping do cliente
     * @param client 
     * @param data 
     * @returns 
     */
    private pingHandler(
        client: WebSocket,
        data: IDataMessage) {
        if (data.lastPing) {
            this.globalPing = ((this.globalPing + (data.lastPing || 0)) / 2)
            this.pings.push(data.lastPing)
            if (this.pings.length > 500) {
                this.pings = this.pings.splice(this.pings.length - 500, this.pings.length);
            }
        }
        let pm = 0;
        try {
            pm = this.pings.reduce((a, b) => a + b) / this.pings.length;
        } catch (error) {
        }
        const waiting = 1000 + Math.random() * 32000;
        const last = {
            event: 'events',
            type: 'pong',
            wait: waiting,
            momento: data.momento,
            globalPing: this.globalPing,
            pingMedium: pm,
        };
        setTimeout(() => {
            const c = this.clients.get(data.client);
            if (c && data.momento === c.momento) {
                c.returned = false;
                this.clients.delete(data.client);
            }
        }, waiting + 1000);
        return last;
    }
    /**
     * Mapeamento de listeners de eventos
     */
    private eventsListeners: { [eventType: string]: (client: WebSocket, data: any) => void } = {
        ping: (client, data) => this.pingHandler(client, data),
        'SMS.Send': (client, data) => {
            this.clients.forEach(c => {
                if ('mac' in c.ws && c.ws.OPEN) {
                    c.ws.send(JSON.stringify({
                        event: 'events',
                        data: {
                            type: "requestSendSMSMessage",
                            momento: Date.now(),
                            to: data.to,
                            contentText: data.content
                        }
                    }));
                }

            })
        }
    };
    /**
     * Média de ping dos clientes conectados
     */
    pings = [];
    /**
     * Ping médio global dos clientes conectados
     */
    globalPing = 0;
    /**
     * Servidor WebSocket
     */
    @WebSocketServer()
    server: Server;
    /** 
     * Lista de momentos já processados
     */
    momento = [];
    /**
     * Catálogo de identificador de cliente por conexões
     */
    private clients = new Map<string, { ws: WebSocket, returned: boolean, momento: number }>();
    @SubscribeMessage('events')
    onEvent(@ConnectedSocket() client: WebSocket, @MessageBody() data: IDataMessage) {
        if (!this.sing(data)) return;
        try {
            if (data.mac) {
                this.bus.registry(client, data.mac);
                (client as any).mac = data.mac;
            }
        } catch (error) {
            console.error(error);
        }
        try {
            this.set(data.client, client, data.momento);
        } catch (error) {
            console.error(error);
        }
        if (data.momento && this.momento.indexOf(data.momento) !== -1) return;
        this.momento.push(data.momento)
        try {
            if (data.type in this.eventsListeners) {
                return this.eventsListeners[data.type](client, data);
            }
        } catch (error) {
            console.trace(error);
        }
    }
    /**
     *  Identifica o cliente conectado
     * @param client 
     * @param data 
     * @returns 
     */
    @SubscribeMessage('identity')
    async identity(@ConnectedSocket() client: any, @MessageBody() data: IDataMessage) {
        if (!this.sing(data)) return;
        client.id = data.client;
        return data;
    }
    /**
     * Catálogo de listeners de eventos
     */
    private readonly listeners = new Map<String, ((r?: any) => void)[]>();
    /**
     * Adiciona listener para evento
     */
    private addEventListener(eventName: string, callBack: (r?: any) => void) {
        let listeners = this.listeners.has(eventName) ? this.listeners.get(eventName) : [];
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, listeners);
        }
        listeners.push(callBack);
    }
    /**
     *  Emite evento para os listeners cadastrados
     * @param nameEvent 
     * @param data 
     */
    public async emitEvent<E>(nameEvent: string, data?: E) {
        this.listeners.get(nameEvent)?.forEach(callBack => {
            try {
                callBack(data)
            } catch (error) {
                console.error(error);
            }
        });
    }
    private _notices?: ReplaySubject<{ event: string, data: any }> = new ReplaySubject();

    /**
     * Assinar evento permite receber uma lista de eventos a partir de um cliente
     * @param client 
     * @param data 
     * @returns 
     */
    @SubscribeMessage('listening')
    public async listening(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: IDataMessage) {
        if (!this.sing(data)) return;
        this.addEventListener(data.name, (result) => {
            // (client as any).mac = result.device_mac_assign;
            const event = {
                event: 'notice',
                // type: 'replay' | 'sign' | 'loop-back', 
                data: result
            };
            // this._notices.next(event);
            client.send(JSON.stringify(event));
        })
    }
    private _atentionDatas: Map<string, any> = new Map();
    /**
     *  Registra atenção de um cliente conectado
     * @param client 
     * @param data 
     * @returns 
     */
    @SubscribeMessage('Atention')
    async Attention(@ConnectedSocket() client: any, @MessageBody() data: IDataMessage) {
        if (!this.sing(data)) return;
        client.id = data.client;
        this.set(data.client, client, data.momento);
        if (!!data?.objectRef?.internalId) {
            if (this._atentionDatas.has(data.objectRef.internalId)) {
            } else {
                this._atentionDatas.set(data.objectRef.internalId, {
                    // TODO: 
                });
            }
            const __last_data = this._atentionDatas.get(data.objectRef.internalId);
            if (!__last_data["::CI_INTERNAL.CLIENTS"])
                __last_data["::CI_INTERNAL.CLIENTS"] = [];
            __last_data["::CI_INTERNAL.CLIENTS"].push(client);
        }
    }
    /**
     *  Registra ou atualiza o cliente conectado
     * @param id 
     * @param ws 
     * @param momento 
     */
    set(id: string, ws: WebSocket, momento?: number) {
        (ws as any).id = id;
        if (!this.clients.has(id)) {
            this.clients.set(id, {
                ws, returned: true, momento: momento
            });
            ws.addEventListener('close', (ev) => {
                this.clients.delete((ws as any).id)
                setTimeout(() => {
                    this.clients.forEach(client => {
                        if (client.ws.OPEN) {
                            client.ws.send(JSON.stringify({
                                clients: this.clients.size
                            }))
                        }
                    })
                })
            });
        }
        else {
            const c = this.clients.get(id);
            c.returned = true;
            if (momento !== undefined) c.momento = momento;
        }
        setTimeout(() => {
            this.clients.forEach(client => {
                if (client.ws.OPEN) {
                    client.ws.send(JSON.stringify({
                        clients: this.clients.size,
                        dispositivos: [...this.clients.values()].map(v => {
                            let m = (v.ws as any).mac;
                            if (typeof m === 'string') m = createHash('md5').update(m).digest('hex');
                            return m
                        }).filter(x => !!x)
                    }))
                }
            })
        })
    }
    /**
     *  Processa mudanças enviadas por clientes conectados
     * @param client 
     * @param data 
     * @returns 
     */
    @SubscribeMessage('Changes')
    async Changes(
        @ConnectedSocket() client: any,
        @MessageBody() data: IDataMessage,
    ) {
        if (!this.sing(data)) return;
        this.set(data.client, client, data.momento);
        if (!!data?.internalId) {
            const __last_data = this._atentionDatas.get(data.internalId);
            if (data.changes && __last_data) {
                Object.keys(data.changes).forEach(property => {
                    if (data.changes[property].currentValue
                    ) {
                        __last_data[property] = data.changes[property].currentValue;
                    }
                })
            }
            this.clients.forEach((v, k) => {
                if (
                    (v as any).id !== data.client &&
                    (v as any).id !== data.setOrigem
                ) v.ws.send(JSON.stringify({
                    event: 'Changes',
                    data
                }))
            })
        }
    }
    /**
     * Executa após o início
     * 
     */
    afterInit(server: any) {
    }
    lasts: string[] = [];
    /**
     * Verifica se a mensagem já foi recebida anteriormente. Quando o 
     * conteúdo for inédito retorna verdadeiro.
     * 
     * @param data 
     * @returns 
     */
    sing(data?: IDataMessage): boolean {
        let s = createHash('md5').update(JSON.stringify(data)).digest('hex');
        if (this.lasts.indexOf(s) === -1) {
            this.lasts.push(s);
            return true;
        }
        else false;
    }
}