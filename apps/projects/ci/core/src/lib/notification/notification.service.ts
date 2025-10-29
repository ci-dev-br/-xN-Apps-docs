import { Injectable } from "@angular/core";

@Injectable()
export class NotificationService {
    permission?: 'granted' | 'none' | 'block' | 'denied' | 'default';
    constructor(

    ) { }
    async requestPermission() {
        // TODO: implementar camada de notificação.sds
        //  this.permission = await Notification.requestPermission();
    }

    private async showNotification(title: string, message: string) {
        if (this.permission === 'granted') {

            const notification = new Notification(title, { body: message, requireInteraction: true });
        }
    }
}