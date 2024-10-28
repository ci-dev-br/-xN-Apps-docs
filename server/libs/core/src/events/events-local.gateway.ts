import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { EventsGateway } from "./events.gateway";
import { Server } from "ws";

@WebSocketGateway(
    42,
    {
        transports: ['websocket'],
        // cors: [DomainService.whitelist, // TODO: não pode ser utilizado cliente coringa. Deve ser criada modelo de Domínios permitidos, cada um com suas blacklists de bloqueio se ouver e regras adicionais de política de acesso pode ser necessárias.
        // ],
    })
export class EventsLocalGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;
    constructor(
        private readonly events?: EventsGateway,
    ) {

        console.log('Hello')
    }
    afterInit(server: any) {
        console.log('Hello2')
    }
}