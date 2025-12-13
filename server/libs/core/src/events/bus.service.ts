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
                this.emit('silent', { moment: Date.now() })
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

    async addEventListner(name: string, hanlder: () => void) {
        //c this.events.
    }

    async sendMessgeToDevice(mac: string | null, eventName: string, message: any) {
        (BusService.clients.get(mac) || BusService.clients.values().return().value).emit(eventName, message);
    }
}