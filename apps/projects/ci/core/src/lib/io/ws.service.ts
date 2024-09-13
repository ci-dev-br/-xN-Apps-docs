import { Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable()
export class WsService {
    private retryWait = 100;
    private _grant_connection = false;
    private _subject?: WebSocketSubject<any>;
    get subject() {
        if (!this._subject) {
            this.init();
        }
        return this._subject;
    }
    constructor(
    ) {
        setTimeout(() => this.init());
    }
    async grantConnection() {
        this._grant_connection = true;
    }
    async init() {
        if (this._subject) {
            this._subject.complete();
        }
        this._subject = webSocket('ws://apps.ci.dev.br:81');
        this._subject.subscribe(message => {
            this.receiveData(message)
        }, erros => {
            erros;
            console.error('erro', erros)
            if (erros instanceof CloseEvent || (erros instanceof Event && erros.type === 'error')) {
                if (this._subject) this._subject?.complete();
                this._subject = undefined;
                setTimeout(() => {
                    this.init();
                }, this.retryWait);
                this.retryWait = this.retryWait + 500;
            }

        }, () => {
            console.info('Fim')
        });
        this._subject.next({ event: 'events', data: { type: 'ping' } });
    }
    private async receiveData(data?: any) {
        // console.log(data);
        if (data.type === 'pong') {
            setTimeout(() => {
                this.emit({ event: 'events', data: { type: 'ping' } });
            }, data.wait || 1000);
        }
    }
    emit(payload: any) {
        this.subject?.next(payload);
    }
}