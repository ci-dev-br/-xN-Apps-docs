import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "ws";
@WebSocketGateway(81, {
    transports: ['websocket'],
    cors: ['http://apps.ci.dev.br:4200',
        'https://192.168.0.119:4200',
        'https://apps.ci.dev.br:446',
        'http://apps.ci.dev.br:86',],

})
export class EventsGateway implements OnGatewayInit {
    pings = [];
    globalPing = 0;
    @WebSocketServer()
    server: Server;
    @SubscribeMessage('events')
    onEvent(@ConnectedSocket() client: any, @MessageBody() data: any) {
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
    async identity(@MessageBody() data: number) {
        return data;
    }
    afterInit(server: any) {

    }
}