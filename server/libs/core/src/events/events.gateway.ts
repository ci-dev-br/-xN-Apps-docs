import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "ws";
@WebSocketGateway({
    transports: ['websocket'],
    cors: ['*',
    ],

})
export class EventsGateway implements OnGatewayInit {
    constructor() { }
    pings = [];
    globalPing = 0;
    @WebSocketServer()
    server: Server;
    m = [];
    @SubscribeMessage('events')
    onEvent(@ConnectedSocket() client: any, @MessageBody() data: any) {
        if (data.momentum && this.m.indexOf(data.momentum) !== -1) return;
        this.m.push(data.momentum)
        if (data.type === 'ping') {
            // data.__consumed = true;
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
            return {
                event: 'events',
                type: 'pong',
                wait: 1000 + Math.random() * 14000/* 1000 + Math.random() * 5000 */,
                momentum: data.momentum,
                globalPing: this.globalPing,
                pingMedium: pm,
            }
        }
    }
    @SubscribeMessage('identity')
    async identity(@ConnectedSocket() client: any, @MessageBody() data: any) {
        client.id = data.client;
        return data;
    }
    private _atentionDatas: Map<string, any> = new Map();
    @SubscribeMessage('Atention')
    async Atention(@ConnectedSocket() client: any, @MessageBody() data: any) {
        if (!!data?.objectRef?.internalId) {
            if (this._atentionDatas.has(data.objectRef.internalId)) {
            } else {
                this._atentionDatas.set(data.objectRef.internalId, { /* ...data.objectRef */ });
            }
            const __last_data = this._atentionDatas.get(data.objectRef.internalId);
            if (!__last_data["::CI_INTERNAL.CLIENTS"])
                __last_data["::CI_INTERNAL.CLIENTS"] = [];
            __last_data["::CI_INTERNAL.CLIENTS"].push(client);
        }
    }
    @SubscribeMessage('Changes')
    async Changes(
        @ConnectedSocket() client: any,
        @MessageBody() data: any,
    ) {
        if (!!data?.internalId) {
            const __last_data = this._atentionDatas.get(data.internalId);
            if (data.changes && __last_data) {
                Object.keys(data.changes).forEach(property => {
                    if (data.changes[property].currentValue) {
                        __last_data[property] = data.changes[property].currentValue;
                    }
                })
            }
            if (Array.isArray(
                __last_data["::CI_INTERNAL.CLIENTS"])) [...__last_data["::CI_INTERNAL.CLIENTS"]].forEach((clients: any) => {
                    clients.send(JSON.stringify({
                        event: 'Changes',
                        data
                    }))
                    // }
                })
        }
    }
    afterInit(server: any) {

    }
}