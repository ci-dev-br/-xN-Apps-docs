import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { Subscription } from "rxjs";
import { AudioModemService } from "./aio.service";
import { isPlatformBrowser } from "@angular/common";
export interface ChatMessage {
    text: string;
    sender: 'me' | 'other';
}
@Component({
    selector: 'aio-chat',
    template: `
    <div class="chat-container">
      <h2>Chat Ultrassônico 🦇</h2>
      
      <div class="controls">
        <button (click)="toggleListening()" [class.listening]="isListening">
          {{ isListening ? 'Parar de Escutar' : 'Começar a Escutar (Microfone)' }}
        </button>
      </div>
      <div class="message-box">
        <div *ngFor="let msg of messages" 
             [ngClass]="{'msg-me': msg.sender === 'me', 'msg-other': msg.sender === 'other'}">
          {{ msg.text }}
        </div>
      </div>
      <div class="input-area">
        <input type="text" [(ngModel)]="newMessage" placeholder="Digite sua mensagem..." (keyup.enter)="sendMessage()">
        <button (click)="sendMessage()" [disabled]="!newMessage.trim()">Enviar 🔊</button>
      </div>
    </div>
    `,
    styles: [
        `.chat-container { font-family: sans-serif; border-radius: 8px; padding: 15px; }
    .controls { margin-bottom: 15px; text-align: center; }
    button { padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; background: #007bff; color: white; }
    button.listening { background: #dc3545; }
    button:disabled { background: #ccc; }
    .message-box { height: 300px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 15px; background: #fafafa; }
    .msg-me { text-align: right; color: blue; margin-bottom: 5px; }
    .msg-other { text-align: left; color: green; margin-bottom: 5px; }
    .input-area { display: flex; gap: 10px; }
    input { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }`
    ],
    standalone: false
})
export class AIOChatComponent implements OnInit, OnDestroy {
    messages: ChatMessage[] = [];
    newMessage: string = '';
    isListening = false;
    private sub!: Subscription;
    protected isBrowser: boolean;
    constructor(private audioModem: AudioModemService,
        @Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }
    ngOnInit() {
        if (!this.isBrowser) return;
        this.sub = this.audioModem.messageReceived.subscribe(text => {
            this.messages.push({ text, sender: 'other' });
        });
    }
    async toggleListening() {
        if (!this.isBrowser) return;
        if (this.isListening) {
            this.audioModem.stopListening();
        } else {
            await this.audioModem.startListening();
        }
        this.isListening = !this.isListening;
    }
    async sendMessage() {
        if (!this.isBrowser) return;
        if (!this.newMessage.trim()) return;
        const textToSend = this.newMessage;
        this.messages.push({ text: textToSend, sender: 'me' });
        this.newMessage = '';
        await this.audioModem.sendMessage(textToSend);
    }
    ngOnDestroy() {
        if (!this.isBrowser) return;
        if (this.sub) this.sub.unsubscribe();
        this.audioModem.stopListening();
    }
}