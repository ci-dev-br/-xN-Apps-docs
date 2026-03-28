import { Component } from "@angular/core";
import { AIOModule } from "./aio.module";
@Component({
    selector: 'ci-aio-chat-card',
    template: '<aio-chat></aio-chat>',
    imports: [
        AIOModule,
    ],
    standalone: true,
})
export class CardAIOChatComponent { }
export const AIOChatCardInfo = {
    title: 'Audio IO Chat',
    descricao: `Audio I/O Chat. Chat para troca de mensagens no mesmo ambiente e offline.`,
    tags: ['aio', 'Chat', 'Mensagem'],
    componentRef: CardAIOChatComponent,
    componentVersion: '1.0.0',
    componentName: 'CardAIOChatComponent',
    settings: {
        // url: { label: 'Url' }
    }
};