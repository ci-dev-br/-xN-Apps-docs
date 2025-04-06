import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { EventsGateway } from "./events.gateway";
import { Server } from "ws";
import { BusService } from "./events.service";
import { DomainService } from "@ci/manager";

export interface IEventPayload {
    mac?: string;
    iam?: string;
}
@WebSocketGateway(
    664,
    {
        transports: ['websocket'],
        // cors: ['*', // DomainService.whitelist, // TODO: não pode ser utilizado cliente coringa. Deve ser criada modelo de Domínios permitidos, cada um com suas blacklists de bloqueio se ouver e regras adicionais de política de acesso pode ser necessárias.
        // ],
    })
export class EventsLocalGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;
    constructor(
        private readonly events?: EventsGateway,
        private readonly bus?: BusService,
    ) {
        console.log('Hello')
    }
    afterInit(server: any) {
        console.log('Hello2')
        server;
    }
    @SubscribeMessage('events')
    async eventHandler(
        @ConnectedSocket() client: WebSocket,
        @MessageBody() data: IEventPayload) {
        // data;
        // client;
        // console.log(data);
        client.send(JSON.stringify({
            event: 'events',
            data: {
                signal: -1,
            }
        }))
        if (data.mac) {
            this.bus.registry(client, data.mac);
        }
    }
}