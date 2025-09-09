import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { createHash } from "crypto";
import { Server } from "ws";
import { BusService } from "./bus.service";
import { Socket } from "socket.io";
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
        private readonly bus: BusService
        ,
    ) {
        bus.events = this;
    }
    private pingHandler(client: WebSocket, data: any) {
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
            momentum: data.momentum,
            globalPing: this.globalPing,
            pingMedium: pm,
        };
        setTimeout(() => {
            const c = this.clients.get(data.client);
            if (c && data.momentum === c.momentum) {
                c.returned = false;
                this.clients.delete(data.client);
            }
        }, waiting + 1000);
        return last;
    }
    private eventsListeners: { [eventType: string]: (client: WebSocket, data: any) => void } = {
        ping: (client, data) => this.pingHandler(client, data),
        'SMS.Send': (client, data) => {
            this.clients.forEach(c => {
                if ('mac' in c.ws && c.ws.OPEN) {
                    c.ws.send(JSON.stringify({
                        event: 'events',
                        data: {
                            type: "requestSendSMSMessage",
                            momentum: Date.now(),
                            to: data.to,
                            contentText: data.content
                        }
                    }));
                }

            })
        }
    };
    pings = [];
    globalPing = 0;
    @WebSocketServer()
    server: Server;
    mementu = [];
    private clients = new Map<string, { ws: WebSocket, returned: boolean, momentum: number }>();
    @SubscribeMessage('events')
    onEvent(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
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
            this.set(data.client, client, data.momentum);
        } catch (error) {
            console.error(error);
        }
        if (data.momentum && this.mementu.indexOf(data.momentum) !== -1) return;
        this.mementu.push(data.momentum)
        try {
            if (data.type in this.eventsListeners) {
                return this.eventsListeners[data.type](client, data);
            }
        } catch (error) {
            console.trace(error);
        }
    }
    @SubscribeMessage('identity')
    async identity(@ConnectedSocket() client: any, @MessageBody() data: any) {
        if (!this.sing(data)) return;
        client.id = data.client;
        return data;
    }
    private readonly listeners = new Map<String, ((r?: any) => void)[]>();
    private addEventListner(eventName: string, callBack: (r?: any) => void) {
        let listners = this.listeners.has(eventName) ? this.listeners.get(eventName) : [];
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, listners);
        }
        listners.push(callBack);
    }
    public async emitEvent<E>(nameEvent: string, data?: E) {
        this.listeners.get(nameEvent)?.forEach(callBack => {
            try {
                callBack(data)
            } catch (error) {
                console.error(error);
            }
        });
    }
    @SubscribeMessage('listening')
    public async listening(@ConnectedSocket() client: Socket,
        @MessageBody() data: {
            name: string,
        }) {
        if (!this.sing(data)) return;
        this.addEventListner(data.name, (result) => {
            // (client as any).mac = result.device_mac_assign;
            client.send(JSON.stringify({
                event: 'notice',
                data: result
            }))
        })
    }
    private _atentionDatas: Map<string, any> = new Map();
    @SubscribeMessage('Atention')
    async Atention(@ConnectedSocket() client: any, @MessageBody() data: any) {
        if (!this.sing(data)) return;
        client.id = data.client;
        this.set(data.client, client, data.momentum);
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
    set(id: string, ws: WebSocket, momentum?: number) {
        (ws as any).id = id;
        if (!this.clients.has(id)) {
            this.clients.set(id, {
                ws, returned: true, momentum
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
            if (momentum !== undefined) c.momentum = momentum;
        }
        setTimeout(() => {
            this.clients.forEach(client => {
                if (client.ws.OPEN) {
                    client.ws.send(JSON.stringify({
                        clients: this.clients.size,
                        dispositivos: [...this.clients.values()].map(v => {
                            return (v.ws as any).mac
                        }).filter(x => !!x)
                    }))
                }
            })
        })
    }
    @SubscribeMessage('Changes')
    async Changes(
        @ConnectedSocket() client: any,
        @MessageBody() data: any,
    ) {
        if (!this.sing(data)) return;
        this.set(data.client, client, data.momentum);
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
    sing(data?: any) {
        let s = createHash('md5').update(JSON.stringify(data)).digest('hex');
        if (this.lasts.indexOf(s) === -1) {
            this.lasts.push(s);
            return true;
        }
        else false;
    }
}