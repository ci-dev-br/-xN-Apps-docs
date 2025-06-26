import { Injectable } from "@nestjs/common";
export class BusEvent {
    readonly name: string = 'event';
    constructor(name?: string, private readonly data?: any) {
        this.name = name;
    }
}
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
    // private _last_signal: number = undefined;
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
    private clients = new Map<string, BusClientSignal>();
    constructor(
    ) { }
    registry(client: WebSocket, mac: string) {
        let bus_client_signal = this.clients.has(mac) ? this.clients.get(mac) : this.clients.set(mac, new BusClientSignal()).get(mac);
        bus_client_signal.addClient(client);
    }

    async addEventListner(name: string, hanlder: () => void) {

    }

    async sendMessgeToDevice(mac: string | null, eventName: string, message: any) {
        (this.clients.get(mac) || this.clients.values().return().value).emit(eventName, message);
    }
}