import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TerminalService } from '../service/terminal.service';
@WebSocketGateway({
    cors: {
        origin: '*', // Ajuste conforme a segurança da sua aplicação
    },
})
export class TerminalGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    constructor(private readonly terminalService: TerminalService) { }
    handleConnection(client: Socket) {
        // Ao conectar, cria um processo de terminal dedicado para este cliente
        this.terminalService.createSession(client.id, (data) => {
            // Quando o terminal gera texto (stdout), envia para o frontend
            client.emit('output', data);
        });
    }
    handleDisconnect(client: Socket) {
        // Limpa o processo ao desconectar
        this.terminalService.killSession(client.id);
    }
    @SubscribeMessage('input')
    handleInput(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: string,
    ) {
        // === LÓGICA DE SUPERVISÃO ===
        // Aqui você pode implementar filtros, logs de auditoria ou bloqueios.
        // Exemplo Simples: Bloquear comandos perigosos
        // Nota: Isolar comandos em stream de caracteres cru é complexo, 
        // mas para fins didáticos, imagine que verificamos padrões.
        // Na prática, para supervisão robusta, você logaria o input aqui:
        // Logger.log(`User ${client.id} typed: ${JSON.stringify(payload)}`);
        // Se aprovado, escreve no terminal real
        this.terminalService.write(client.id, payload);
    }
    @SubscribeMessage('resize')
    handleResize(
        @ConnectedSocket() client: Socket,
        @MessageBody() size: { cols: number; rows: number },
    ) {
        this.terminalService.resize(client.id, size.cols, size.rows);
    }
}