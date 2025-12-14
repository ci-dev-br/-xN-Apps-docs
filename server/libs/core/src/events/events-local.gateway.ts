import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { EventsGateway } from "./events.gateway";
import { Server } from "ws";
import { BusService } from "./bus.service";
// import { DomainService } from "@ci/manager";

/**
 * Payload do evento
 */
export interface IEventPayload {
    /**
     * Endereço MAC do dispositivo
     */
    mac?: string;
    /**
     * Identificador do IAM do dispositivo
     */
    iam?: string;
}
@WebSocketGateway(
    3333, // alterado para 3333, está em conflito  ....
    {
        transports: ['websocket'],
        // cors: ['*', // DomainService.whitelist, // TODO: não pode ser utilizado cliente coringa. Deve ser criada modelo de Domínios permitidos, cada um com suas blacklists de bloqueio se ouver e regras adicionais de política de acesso pode ser necessárias.
        // ],
    })
export class EventsLocalGateway implements OnGatewayInit {
    /**
     * Servidor WebSocket
    */
    @WebSocketServer()
    server: Server;
    constructor(
        private readonly events?: EventsGateway,
        private readonly bus?: BusService,
    ) {
    }
    /**
     * Inicialização do gateway
     */
    afterInit(server: any) {
        server;
    }
    /**
     * Manipulador de evento 'events'
     */
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