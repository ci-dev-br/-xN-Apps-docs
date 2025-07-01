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
        private readonly bus: BusService,
    ) {
        console.info('[events]')
    }
    pings = [];
    globalPing = 0;
    @WebSocketServer()
    server: Server;
    mementu = [];
    private clients = new Map<string, { ws: WebSocket, returned: boolean, momentum: number }>();
    @SubscribeMessage('events')
    onEvent(@ConnectedSocket() client: any, @MessageBody() data: any) {
        if (!this.sing(data)) return;
        try {
            if (data.mac) {
                this.bus.registry(client, data.mac);
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

            if (data.type === 'ping') {
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
                const waiting = 1000 + Math.random() * 14000;
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
                console.log(' Clients: ' + this.clients.size);
                return last;
            }
        } catch (error) {

        }
    }
    @SubscribeMessage('identity')
    async identity(@ConnectedSocket() client: any, @MessageBody() data: any) {
        if (!this.sing(data)) return;
        console.log(data);
        client.id = data.client;
        return data;
    }
    private readonly listeners = new Map<String, ((r?: any) => void)[]>();
    private addEventListner(eventName: string, callBack: (r?: any) => void) {
        let l = this.listeners.has(eventName) ? this.listeners.get(eventName) : [];
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, l);
        }
        l.push(callBack);
    }
    private emitEvent(nameEvent: string, data: any) {
        this.listeners.get(nameEvent)?.forEach(x => {
            try {
                x(data)
            } catch (error) {
                console.error(error);
            }
        });
    }
    @SubscribeMessage('listening')
    async listening(@ConnectedSocket() client: Socket,
        @MessageBody() data: {
            name: string,
        }) {
        if (!this.sing(data)) return;

        this.addEventListner(data.name, (r) => {
            client.send(JSON.stringify({
                emit: 'notice',
                result: r
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
    set(id: string, ws: any, momentum?: number) {
        ws.id = id;
        if (!this.clients.has(id)
        )
            this.clients.set(id, {
                ws, returned: true, momentum
            });
        else {
            const c = this.clients.get(id);
            c.returned = true;
            if (momentum !== undefined) c.momentum = momentum;
        }
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