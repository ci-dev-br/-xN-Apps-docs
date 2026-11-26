import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, distinctUntilChanged, interval, map } from 'rxjs';
import { BaseService } from '../lib/base-service';
import { ApiConfiguration } from '../lib/api-configuration';
import { UserAuthenticationService } from '@ci/auth';
import { User } from '../lib/models/user';

export interface InternalNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'MENSAGEM' | 'GRUPO' | 'SISTEMA' | 'INFO' | 'AVISO' | string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
}

export type NotificationDisplayMode = 'menu' | 'sidebar' | 'statusbar';

export interface NotificationUserPreferences {
  enabled: boolean;
  displayMode: NotificationDisplayMode;
  pushEnabled: boolean;
  soundEnabled: boolean;
  mutedTypes: string[];
}

export const NOTIFICATION_PREF_CODES = {
  ENABLED: 'NOTIF_ENABLED',
  DISPLAY_MODE: 'NOTIF_DISPLAY_MODE',
  PUSH_ENABLED: 'NOTIF_PUSH_ENABLED',
  SOUND_ENABLED: 'NOTIF_SOUND_ENABLED',
  MUTED_TYPES: 'NOTIF_MUTED_TYPES',
} as const;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationUserPreferences = {
  enabled: true,
  displayMode: 'menu',
  pushEnabled: true,
  soundEnabled: true,
  mutedTypes: [],
};

export interface NotificationResponse {
  unreadCount: number;
  notifications: InternalNotification[];
  preferences?: Partial<NotificationUserPreferences>;
}

const DISPLAY_MODE_STORAGE_KEY = 'ci_notification_display_mode';
const PREFS_STORAGE_KEY = 'ci_notification_preferences';

@Injectable({
  providedIn: 'root'
})
export class InternalNotificationService extends BaseService {
  private rawNotifications: InternalNotification[] = [];
  private rawUnreadCount?: number;

  private notificationsSubject = new BehaviorSubject<InternalNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  public pushPermissionStatus = new BehaviorSubject<NotificationPermission>('default');

  private preferencesSubject = new BehaviorSubject<NotificationUserPreferences>(this.getStoredPreferences());
  public preferences$ = this.preferencesSubject.asObservable();
  public get preferences(): NotificationUserPreferences {
    return this.preferencesSubject.value;
  }

  public notificationsEnabled$: Observable<boolean> = this.preferences$.pipe(
    map(p => p.enabled),
    distinctUntilChanged()
  );
  public pushEnabled$: Observable<boolean> = this.preferences$.pipe(
    map(p => p.pushEnabled),
    distinctUntilChanged()
  );
  public soundEnabled$: Observable<boolean> = this.preferences$.pipe(
    map(p => p.soundEnabled),
    distinctUntilChanged()
  );
  public mutedTypes$: Observable<string[]> = this.preferences$.pipe(
    map(p => p.mutedTypes),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  // Modo de exibição: menu (popup), sidebar (aba lateral à direita), statusbar (inferior)
  private displayModeSubject = new BehaviorSubject<NotificationDisplayMode>(this.preferencesSubject.value.displayMode);
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
  private currentUserId?: string;
  private pendingLocalPrefSync = false;

  constructor(
    config: ApiConfiguration,
    http: HttpClient,
    @Optional() private userService?: UserAuthenticationService
  ) {
    super(config, http);
    this.checkPushPermission();

    this.userService?.user.subscribe((user) => {
      if (user?.id) {
        const isSameUser = this.currentUserId === user.id;
        this.currentUserId = user.id;

        const basePrefs = this.getStoredPreferences(user.id);
        const merged = this.mergePreferencesFromUser(user, basePrefs);
        this.applyPreferencesLocally(merged, user.id, false);

        if (!isSameUser) {
          this.carregarPreferencias();
        }
        if (this.preferences.enabled) {
          this.startPolling();
          this.carregarNotificacoes();
        } else {
          this.stopPolling();
          this.rawNotifications = [];
          this.rawUnreadCount = 0;
          this.notificationsSubject.next([]);
          this.unreadCountSubject.next(0);
          this.lastKnownCount = 0;
        }
      } else {
        this.currentUserId = undefined;
        this.stopPolling();
        this.rawNotifications = [];
        this.rawUnreadCount = 0;
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
        this.lastKnownCount = 0;
        this.isSidebarOpenSubject.next(false);
        this.isStatusbarExpandedSubject.next(false);
      }
    });
  }

  public setDisplayMode(mode: NotificationDisplayMode) {
    this.updatePreferences({ displayMode: mode });
  }

  public setNotificationsEnabled(enabled: boolean) {
    this.updatePreferences({ enabled: Boolean(enabled) });
  }

  public setPushEnabled(pushEnabled: boolean) {
    this.updatePreferences({ pushEnabled: Boolean(pushEnabled) });
  }

  public setSoundEnabled(soundEnabled: boolean) {
    this.updatePreferences({ soundEnabled: Boolean(soundEnabled) });
  }

  public setMutedTypes(mutedTypes: string[]) {
    this.updatePreferences({
      mutedTypes: (mutedTypes || []).map(t => String(t).trim().toUpperCase()).filter(Boolean)
    });
  }

  public toggleMutedType(type: string) {
    const key = (type || '').trim().toUpperCase();
    if (!key) return;
    const current = this.preferences.mutedTypes;
    const exists = current.includes(key);
    const next = exists ? current.filter(t => t !== key) : [...current, key];
    this.updatePreferences({ mutedTypes: next });
  }

  public isTypeMuted(type: string): boolean {
    const key = (type || '').trim().toUpperCase();
    return Boolean(key && this.preferences.mutedTypes.includes(key));
  }

  public updatePreferences(updates: Partial<NotificationUserPreferences>, syncRemote = true) {
    const current = this.preferencesSubject.value;
    const next = this.normalizePreferences({
      ...current,
      ...updates,
    });

    const wasEnabled = current.enabled;
    this.applyPreferencesLocally(next, this.currentUserId, true);

    if (next.displayMode !== 'sidebar') this.isSidebarOpenSubject.next(false);
    if (next.displayMode !== 'statusbar') this.isStatusbarExpandedSubject.next(false);

    if (!next.enabled) {
      this.stopPolling();
      this.notificationsSubject.next([]);
      this.unreadCountSubject.next(0);
      this.lastKnownCount = 0;
      this.isSidebarOpenSubject.next(false);
      this.isStatusbarExpandedSubject.next(false);
    } else if (!wasEnabled && this.currentUserId) {
      this.startPolling();
      this.carregarNotificacoes();
    } else {
      this.emitFilteredNotifications();
    }

    if (syncRemote && this.currentUserId) {
      this.pendingLocalPrefSync = true;
      this.http.post<NotificationUserPreferences>(`${this.rootUrl}/Notification/Preferences`, next).subscribe({
        next: (saved) => {
          this.pendingLocalPrefSync = false;
          if (saved && typeof saved === 'object') {
            this.applyPreferencesLocally(this.normalizePreferences(saved), this.currentUserId, true);
            this.emitFilteredNotifications();
          }
        },
        error: () => {
          this.pendingLocalPrefSync = false;
        }
      });
    }
  }

  public carregarPreferencias() {
    if (!this.currentUserId) return;
    this.http.get<NotificationUserPreferences>(`${this.rootUrl}/Notification/Preferences`).subscribe({
      next: (remote) => {
        if (!remote || this.pendingLocalPrefSync) return;
        const normalized = this.normalizePreferences({
          ...this.preferencesSubject.value,
          ...remote,
        });
        const prevEnabled = this.preferencesSubject.value.enabled;
        this.applyPreferencesLocally(normalized, this.currentUserId, true);
        if (!normalized.enabled) {
          this.stopPolling();
          this.notificationsSubject.next([]);
          this.unreadCountSubject.next(0);
          this.lastKnownCount = 0;
          this.isSidebarOpenSubject.next(false);
          this.isStatusbarExpandedSubject.next(false);
        } else if (!prevEnabled) {
          this.startPolling();
          this.carregarNotificacoes();
        } else {
          this.emitFilteredNotifications();
        }
      },
      error: () => {}
    });
  }

  private normalizePreferences(raw?: Partial<NotificationUserPreferences> | null): NotificationUserPreferences {
    const mode = raw?.displayMode;
    const displayMode: NotificationDisplayMode =
      mode === 'menu' || mode === 'sidebar' || mode === 'statusbar' ? mode : 'menu';
    const mutedTypes = Array.isArray(raw?.mutedTypes)
      ? Array.from(new Set(raw!.mutedTypes.map(t => String(t).trim().toUpperCase()).filter(Boolean)))
      : [];

    return {
      enabled: raw?.enabled !== undefined ? Boolean(raw.enabled) : true,
      displayMode,
      pushEnabled: raw?.pushEnabled !== undefined ? Boolean(raw.pushEnabled) : true,
      soundEnabled: raw?.soundEnabled !== undefined ? Boolean(raw.soundEnabled) : true,
      mutedTypes,
    };
  }

  private applyPreferencesLocally(prefs: NotificationUserPreferences, userId?: string, persistStorage = true) {
    this.preferencesSubject.next(prefs);
    if (this.displayModeSubject.value !== prefs.displayMode) {
      this.displayModeSubject.next(prefs.displayMode);
    }

    if (persistStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, prefs.displayMode);
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
        if (userId) {
          localStorage.setItem(`${PREFS_STORAGE_KEY}:${userId}`, JSON.stringify(prefs));
        }
      } catch {}
    }
  }

  private getStoredPreferences(userId?: string): NotificationUserPreferences {
    let base: Partial<NotificationUserPreferences> = {};
    if (typeof localStorage !== 'undefined') {
      try {
        const userSpecific = userId ? localStorage.getItem(`${PREFS_STORAGE_KEY}:${userId}`) : null;
        const generic = localStorage.getItem(PREFS_STORAGE_KEY);
        const rawJson = userSpecific || generic;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (parsed && typeof parsed === 'object') {
            base = parsed;
          }
        }
        if (!base.displayMode) {
          const mode = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY) as NotificationDisplayMode;
          if (mode === 'menu' || mode === 'sidebar' || mode === 'statusbar') {
            base.displayMode = mode;
          }
        }
      } catch {}
    }
    return this.normalizePreferences(base);
  }

  private mergePreferencesFromUser(user: User, fallback: NotificationUserPreferences): NotificationUserPreferences {
    const prefsList = user?.preferences;
    if (!Array.isArray(prefsList) || prefsList.length === 0) {
      return fallback;
    }

    const next: NotificationUserPreferences = { ...fallback, mutedTypes: [...fallback.mutedTypes] };
    for (const item of prefsList) {
      const code = item?.code;
      const val = item?.value;
      if (!code || val === undefined || val === null) continue;
      if (code === NOTIFICATION_PREF_CODES.ENABLED) {
        next.enabled = String(val).toLowerCase() !== 'false' && val !== '0';
      } else if (code === NOTIFICATION_PREF_CODES.PUSH_ENABLED) {
        next.pushEnabled = String(val).toLowerCase() !== 'false' && val !== '0';
      } else if (code === NOTIFICATION_PREF_CODES.SOUND_ENABLED) {
        next.soundEnabled = String(val).toLowerCase() !== 'false' && val !== '0';
      } else if (code === NOTIFICATION_PREF_CODES.DISPLAY_MODE && (val === 'menu' || val === 'sidebar' || val === 'statusbar')) {
        next.displayMode = val;
      } else if (code === NOTIFICATION_PREF_CODES.MUTED_TYPES) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            next.mutedTypes = parsed.map(t => String(t).trim().toUpperCase()).filter(Boolean);
          }
        } catch {}
      }
    }
    return this.normalizePreferences(next);
  }

  private filterNotificationsByPrefs(list: InternalNotification[], prefs: NotificationUserPreferences): InternalNotification[] {
    if (!prefs.enabled) return [];
    if (!prefs.mutedTypes || prefs.mutedTypes.length === 0) return list;
    return list.filter(n => !prefs.mutedTypes.includes((n.type || 'INFO').toUpperCase()));
  }

  private emitFilteredNotifications() {
    const prefs = this.preferencesSubject.value;
    if (!prefs.enabled) {
      this.notificationsSubject.next([]);
      this.unreadCountSubject.next(0);
      this.lastKnownCount = 0;
      return;
    }
    const visible = this.filterNotificationsByPrefs(this.rawNotifications, prefs);
    const unread = (prefs.mutedTypes.length === 0 && this.rawUnreadCount !== undefined)
      ? this.rawUnreadCount
      : visible.filter(n => !n.read).length;
    this.notificationsSubject.next(visible);
    this.unreadCountSubject.next(unread);
    this.lastKnownCount = unread;
  }

  public toggleSidebar(open?: boolean) {
    this.isSidebarOpenSubject.next(open !== undefined ? open : !this.isSidebarOpenSubject.value);
  }

  public toggleStatusbar(open?: boolean) {
    this.isStatusbarExpandedSubject.next(open !== undefined ? open : !this.isStatusbarExpandedSubject.value);
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
        // Garante preferência de push ativa quando o usuário opta explicitamente por ativar no banner
        if (!this.preferences.pushEnabled) {
          this.setPushEnabled(true);
        }

        // Dispara notificação de confirmação imediata respeitando preferências
        this.dispararPushLocal({
          id: 'welcome-' + Date.now(),
          userId: this.userService?.user.value?.id || '',
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
    if (!this.preferences.enabled) return;
    this.pollingSub = interval(intervalMs).subscribe(() => {
      if (this.preferences.enabled) {
        this.carregarNotificacoes(true);
      }
    });
  }

  stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  carregarNotificacoes(isBackground = false) {
    if (!this.preferences.enabled) {
      this.isChecking = false;
      this.rawNotifications = [];
      this.rawUnreadCount = 0;
      this.notificationsSubject.next([]);
      this.unreadCountSubject.next(0);
      return;
    }
    if (this.isChecking) return;
    this.isChecking = true;

    this.http.get<NotificationResponse>(`${this.rootUrl}/Notification/My`).subscribe({
      next: (res) => {
        this.isChecking = false;
        if (res.preferences && !this.pendingLocalPrefSync) {
          const synced = this.normalizePreferences({
            ...this.preferencesSubject.value,
            ...res.preferences,
          });
          this.applyPreferencesLocally(synced, this.currentUserId, true);
        }

        const prefs = this.preferencesSubject.value;
        if (!prefs.enabled) {
          this.stopPolling();
          this.rawNotifications = [];
          this.rawUnreadCount = 0;
          this.notificationsSubject.next([]);
          this.unreadCountSubject.next(0);
          this.lastKnownCount = 0;
          return;
        }

        this.rawNotifications = res.notifications || [];
        this.rawUnreadCount = res.unreadCount || 0;

        const visible = this.filterNotificationsByPrefs(this.rawNotifications, prefs);
        const currentUnread = prefs.mutedTypes.length > 0
          ? visible.filter(n => !n.read).length
          : (res.unreadCount || 0);
        const previousUnread = this.lastKnownCount;

        // Se chegaram novas notificações não lidas e não silenciadas em segundo plano
        if (isBackground && currentUnread > previousUnread && visible.length > 0) {
          const newest = visible.find(n => !n.read) || visible[0];
          this.dispararPushLocal(newest);
          this.tocarSomNotificacao();
        }

        this.lastKnownCount = currentUnread;
        this.unreadCountSubject.next(currentUnread);
        this.notificationsSubject.next(visible);
      },
      error: () => {
        this.isChecking = false;
      }
    });
  }

  marcarComoLida(notificacao: InternalNotification): Observable<{ success: boolean }> {
    notificacao.read = true;
    this.rawNotifications = this.rawNotifications.map(n =>
      n.id === notificacao.id ? { ...n, read: true } : n
    );
    const currentUnread = Math.max(0, this.unreadCountSubject.value - 1);
    this.rawUnreadCount = this.rawUnreadCount !== undefined ? Math.max(0, this.rawUnreadCount - 1) : currentUnread;
    this.unreadCountSubject.next(currentUnread);
    this.lastKnownCount = currentUnread;
    this.notificationsSubject.next(this.filterNotificationsByPrefs(this.rawNotifications, this.preferences));

    return this.http.post<{ success: boolean }>(`${this.rootUrl}/Notification/${notificacao.id}/Read`, {});
  }

  marcarTodasComoLidas(): Observable<{ success: boolean; count: number }> {
    this.rawNotifications = this.rawNotifications.map(n => ({ ...n, read: true }));
    this.rawUnreadCount = 0;
    const list = this.filterNotificationsByPrefs(this.rawNotifications, this.preferences);
    this.notificationsSubject.next(list);
    this.unreadCountSubject.next(0);
    this.lastKnownCount = 0;

    return this.http.post<{ success: boolean; count: number }>(`${this.rootUrl}/Notification/ReadAll`, {});
  }

  enviarNotificacaoTeste(): Observable<any> {
    return this.http.post<any>(`${this.rootUrl}/Notification/Test`, {});
  }

  dispararPushLocal(notificacao: InternalNotification) {
    const prefs = this.preferencesSubject.value;
    if (!prefs.enabled || !prefs.pushEnabled) return;
    if (this.isTypeMuted(notificacao?.type)) return;

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
    const prefs = this.preferencesSubject.value;
    if (!prefs.enabled || !prefs.soundEnabled) return;

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
