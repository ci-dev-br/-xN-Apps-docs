import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";

@WebSocketGateway(81, {
    transports: ['websocket'],
    cors: ['http://apps.ci.dev.br:4200',
        'https://192.168.0.119:4200',
        'https://apps.ci.dev.br:446',
        'http://apps.ci.dev.br:86',],

})
export class EventsGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;
    @SubscribeMessage('events')
    onEvent(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (data.type === 'ping') {
            return { event: 'events', type: 'pong', wait: 3000 + Math.random() * 20000 }
        }
    }
    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number) {
        return data;
    }
    afterInit(server: any) {

    }
}