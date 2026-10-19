import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
/**
 * Evento do barramento de eventos
 */
export class BusEvent {
    readonly name: string = 'event';
    constructor(name?: string, private readonly data?: any) {
        this.name = name;
    }
}
/**
 * Cliente do barramento de eventos
 */
export class BusClientSignal {
    signal: number = -2;
    clients: WebSocket[] = [];
    addClient(client: WebSocket) {
        this.clients.push(client);
        this.signal++;
        this.silent();
    }
    addEventListner(eventName: string, event: BusEvent) {
    }
    emit(eventName: string = 'event', data?: any) {
        let event = new BusEvent(eventName);
        this.clients.forEach(client => {
            if (client.OPEN) {
                // client.send()
            }
        })
    }
    private async silent() {
        let _last_signal = this.signal
        setTimeout(() => {
            if (_last_signal === this.signal) {
                this.emit('silent', { momento: Date.now() })
            }
        }, 5000);
    }
}
@Injectable()
export class BusService {
    private static clients = new Map<string, BusClientSignal>();
    // movido para estático apenas para demonstração. deve ser corrigido
    events?: EventsGateway;
    constructor(
        // @Inject(forwardRef(() => EventsGateway))
    ) {
    }
    registry(client: WebSocket, mac: string) {
        // console.log(mac, client);
        let bus_client_signal = BusService.clients.has(mac) ? BusService.clients.get(mac) : BusService.clients.set(mac, new BusClientSignal()).get(mac);
        bus_client_signal.addClient(client);
        this.events?.emitEvent('Gerencial.Devices', {
            status: 1,
            device_mac_assign: mac
        })
    }

    private static activeChaves = new Map<string, WebSocket>();

    static registerChaveAcesso(chaveAcesso: string, ws: WebSocket) {
        if (!chaveAcesso || !ws) return;
        this.activeChaves.set(chaveAcesso, ws);
    }

    static unregisterChaveAcesso(chaveAcesso: string) {
        if (!chaveAcesso) return;
        this.activeChaves.delete(chaveAcesso);
    }

    static isChaveAcessoOnline(chaveAcesso: string): boolean {
        if (!chaveAcesso) return false;
        const ws = this.activeChaves.get(chaveAcesso);
        return !!ws && (ws as any).readyState === 1; // 1 = OPEN
    }

    static disconnectChaveAcesso(chaveAcesso: string) {
        if (!chaveAcesso) return;
        const ws = this.activeChaves.get(chaveAcesso);
        if (ws) {
            try {
                if ((ws as any).readyState === 1) {
                    ws.send(JSON.stringify({
                        event: 'SessionRevoked',
                        data: {
                            chaveAcesso,
                            message: 'Sua sessão foi encerrada neste dispositivo.'
                        }
                    }));
                    ws.close();
                }
            } catch (err) {
                console.trace(err);
            }
            this.activeChaves.delete(chaveAcesso);
        }
    }

    async addEventListner(name: string, hanlder: () => void) {
        //c this.events.
    }

    async sendMessgeToDevice(mac: string | null, eventName: string, message: any) {
        (BusService.clients.get(mac) || BusService.clients.values().return().value).emit(eventName, message);
    }
}