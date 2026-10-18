import { Injectable } from "@angular/core";

@Injectable()
export class NotificationService {
    permission?: 'granted' | 'none' | 'block' | 'denied' | 'default';
    async requestPermission() {
        if ('Notification' in window) {
            // Código seguro para pedir permissão ou enviar notificação
            this.permission = await Notification.requestPermission();
        } else {
            console.warn('Notificações não suportadas neste ambiente (WebView).');
        }
        // TODO: implementar camada de notificação.sds
    }
    private async showNotification(title: string, message: string) {

        if (this.permission === 'granted') {
            const notification = new Notification(title, { body: message, requireInteraction: true });
        }
    }
}