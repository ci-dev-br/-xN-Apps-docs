import { Injectable } from "@angular/core";

interface StoredNotificationPrefs {
    enabled?: boolean;
    pushEnabled?: boolean;
    mutedTypes?: string[];
}

@Injectable()
export class NotificationService {
    permission?: 'granted' | 'none' | 'block' | 'denied' | 'default';

    private getStoredPrefs(): StoredNotificationPrefs {
        if (typeof localStorage === 'undefined') return {};
        try {
            const raw = localStorage.getItem('ci_notification_preferences');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch {}
        return {};
    }

    async requestPermission() {
        const prefs = this.getStoredPrefs();
        if (prefs.enabled === false || prefs.pushEnabled === false) {
            return;
        }
        if (typeof window !== 'undefined' && 'Notification' in window) {
            // Código seguro para pedir permissão ou enviar notificação
            this.permission = await Notification.requestPermission();
        } else {
            console.warn('Notificações não suportadas neste ambiente (WebView).');
        }
    }

    async showNotification(title: string, message: string, type = 'INFO') {
        const prefs = this.getStoredPrefs();
        if (prefs.enabled === false || prefs.pushEnabled === false) {
            return;
        }
        if (Array.isArray(prefs.mutedTypes) && prefs.mutedTypes.includes(String(type).toUpperCase())) {
            return;
        }
        if (typeof window !== 'undefined' && 'Notification' in window && (this.permission === 'granted' || Notification.permission === 'granted')) {
            new Notification(title, { body: message, requireInteraction: true });
        }
    }
}
