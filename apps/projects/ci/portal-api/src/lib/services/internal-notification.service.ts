import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { UserAuthenticationService } from '@ci/auth';

export interface InternalNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'MENSAGEM' | 'GRUPO' | 'SISTEMA' | 'INFO' | 'AVISO' | string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
}

export type NotificationDisplayMode = 'menu' | 'sidebar' | 'statusbar';

export interface NotificationResponse {
  unreadCount: number;
  notifications: InternalNotification[];
}

@Injectable({
  providedIn: 'root'
})
export class InternalNotificationService extends BaseService {
  private notificationsSubject = new BehaviorSubject<InternalNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  public pushPermissionStatus = new BehaviorSubject<NotificationPermission>('default');

  // Modo de exibição: menu (popup), sidebar (aba lateral à direita), statusbar (inferior)
  private displayModeSubject = new BehaviorSubject<NotificationDisplayMode>(this.getStoredDisplayMode());
  public displayMode$ = this.displayModeSubject.asObservable();
  public get displayMode(): NotificationDisplayMode {
    return this.displayModeSubject.value;
  }

  // Estado da aba lateral à direita
  public isSidebarOpenSubject = new BehaviorSubject<boolean>(false);
  public isSidebarOpen$ = this.isSidebarOpenSubject.asObservable();

  // Estado do painel expandido da statusbar inferior
  public isStatusbarExpandedSubject = new BehaviorSubject<boolean>(false);
  public isStatusbarExpanded$ = this.isStatusbarExpandedSubject.asObservable();

  private pollingSub?: Subscription;
  private lastKnownCount = 0;
  private isChecking = false;

  public setDisplayMode(mode: NotificationDisplayMode) {
    this.displayModeSubject.next(mode);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('ci_notification_display_mode', mode);
      } catch {}
    }
    // Fecha painéis abertos ao trocar de modo
    if (mode !== 'sidebar') this.isSidebarOpenSubject.next(false);
    if (mode !== 'statusbar') this.isStatusbarExpandedSubject.next(false);
  }

  private getStoredDisplayMode(): NotificationDisplayMode {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('ci_notification_display_mode') as NotificationDisplayMode;
        if (stored === 'menu' || stored === 'sidebar' || stored === 'statusbar') {
          return stored;
        }
      } catch {}
    }
    return 'menu';
  }

  public toggleSidebar(open?: boolean) {
    this.isSidebarOpenSubject.next(open !== undefined ? open : !this.isSidebarOpenSubject.value);
  }

  public toggleStatusbar(open?: boolean) {
    this.isStatusbarExpandedSubject.next(open !== undefined ? open : !this.isStatusbarExpandedSubject.value);
  }

  constructor(
    config: ApiConfiguration,
    http: HttpClient,
    @Optional() private userService?: UserAuthenticationService
  ) {
    super(config, http);
    this.checkPushPermission();

    this.userService?.user.subscribe((user) => {
      if (user?.id) {
        this.startPolling();
        this.carregarNotificacoes();
      } else {
        this.stopPolling();
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }
    });
  }

  checkPushPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.pushPermissionStatus.next(Notification.permission);
    }
  }

  async solicitarPermissaoPush(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      // Registra o ServiceWorker se disponível
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch {}
      }

      let permission: NotificationPermission = Notification.permission;
      if (permission !== 'granted') {
        try {
          permission = await Notification.requestPermission();
        } catch {
          permission = await new Promise<NotificationPermission>((resolve) => {
            Notification.requestPermission((p) => resolve(p));
          });
        }
      }

      this.pushPermissionStatus.next(permission);

      if (permission === 'granted') {
        // Dispara notificação de confirmação imediata para retorno visual e sonoro
        this.dispararPushLocal({
          id: 'welcome-' + Date.now(),
          title: 'Notificações Ativadas!',
          message: 'Você receberá avisos importantes do sistema neste dispositivo.',
          type: 'SISTEMA',
          read: false,
          createdAt: new Date().toISOString(),
        });
        this.tocarSomNotificacao();

        // Tenta registrar subscrição no PushManager do navegador e sincronizar com o backend
        if ('serviceWorker' in navigator) {
          try {
            const reg = await Promise.race([
              navigator.serviceWorker.ready,
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
            ]);
            if (reg && reg.pushManager) {
              let sub = await reg.pushManager.getSubscription();
              if (!sub) {
                try {
                  sub = await reg.pushManager.subscribe({ userVisibleOnly: true });
                } catch {}
              }
              if (sub) {
                const subJson = sub.toJSON();
                this.http.post(`${this.rootUrl}/Notification/Push/Subscribe`, {
                  endpoint: sub.endpoint,
                  keys: subJson.keys,
                }).subscribe({ error: () => {} });
              }
            }
          } catch {}
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  startPolling(intervalMs = 15000) {
    this.stopPolling();
    this.pollingSub = interval(intervalMs).subscribe(() => {
      this.carregarNotificacoes(true);
    });
  }

  stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  carregarNotificacoes(isBackground = false) {
    if (this.isChecking) return;
    this.isChecking = true;

    this.http.get<NotificationResponse>(`${this.rootUrl}/Notification/My`).subscribe({
      next: (res) => {
        this.isChecking = false;
        const currentUnread = res.unreadCount || 0;
        const previousUnread = this.lastKnownCount;

        // Se chegaram novas notificações não lidas em segundo plano
        if (isBackground && currentUnread > previousUnread && res.notifications.length > 0) {
          const newest = res.notifications[0];
          this.dispararPushLocal(newest);
          this.tocarSomNotificacao();
        }

        this.lastKnownCount = currentUnread;
        this.unreadCountSubject.next(currentUnread);
        this.notificationsSubject.next(res.notifications || []);
      },
      error: () => {
        this.isChecking = false;
      }
    });
  }

  marcarComoLida(notificacao: InternalNotification): Observable<{ success: boolean }> {
    notificacao.read = true;
    const currentUnread = Math.max(0, this.unreadCountSubject.value - 1);
    this.unreadCountSubject.next(currentUnread);
    this.lastKnownCount = currentUnread;

    return this.http.post<{ success: boolean }>(`${this.rootUrl}/Notification/${notificacao.id}/Read`, {});
  }

  marcarTodasComoLidas(): Observable<{ success: boolean; count: number }> {
    const list = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(list);
    this.unreadCountSubject.next(0);
    this.lastKnownCount = 0;

    return this.http.post<{ success: boolean; count: number }>(`${this.rootUrl}/Notification/ReadAll`, {});
  }

  enviarNotificacaoTeste(): Observable<any> {
    return this.http.post<any>(`${this.rootUrl}/Notification/Test`, {});
  }

  dispararPushLocal(notificacao: InternalNotification) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const options: any = {
        body: notificacao.message,
        icon: '/favicon.ico',
        tag: notificacao.id,
        badge: '/favicon.ico',
        data: {
          url: notificacao.actionUrl || '/meus-apps/apps'
        }
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg && typeof reg.showNotification === 'function') {
            reg.showNotification(notificacao.title, options);
          } else {
            try {
              new Notification(notificacao.title, options);
            } catch {}
          }
        }).catch(() => {
          try {
            new Notification(notificacao.title, options);
          } catch {}
        });
      } else {
        try {
          new Notification(notificacao.title, options);
        } catch {}
      }
    } catch {}
  }

  tocarSomNotificacao() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }
}
