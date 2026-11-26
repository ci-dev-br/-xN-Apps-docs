import { Injectable, Logger, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { NotificacaoInterna } from "../models/notificacao-interna.entity";
import { WebPushSubscription } from "../models/web-push-subscription.entity";

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

export interface CriarNotificacaoDto {
    userId: string;
    title: string;
    message: string;
    type?: 'MENSAGEM' | 'GRUPO' | 'SISTEMA' | 'INFO' | 'AVISO';
    actionUrl?: string;
    metadata?: any;
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private readonly fallbackPrefs = new Map<string, NotificationUserPreferences>();

    constructor(
        @InjectRepository(NotificacaoInterna)
        private readonly notifRepo: Repository<NotificacaoInterna>,
        @InjectRepository(WebPushSubscription)
        private readonly pushRepo: Repository<WebPushSubscription>,
        @Optional() private readonly dataSource?: DataSource,
    ) {}

    private parseBoolean(raw: string | undefined | null, fallback: boolean): boolean {
        if (raw === undefined || raw === null || raw === '') return fallback;
        const normalized = String(raw).trim().toLowerCase();
        if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
        if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
        return fallback;
    }

    private parseDisplayMode(raw: string | undefined | null): NotificationDisplayMode {
        if (raw === 'menu' || raw === 'sidebar' || raw === 'statusbar') return raw;
        return DEFAULT_NOTIFICATION_PREFERENCES.displayMode;
    }

    private parseMutedTypes(raw: string | undefined | null): string[] {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(t => String(t).trim().toUpperCase())
                    .filter(Boolean);
            }
        } catch {
            return String(raw)
                .split(',')
                .map(t => t.trim().toUpperCase())
                .filter(Boolean);
        }
        return [];
    }

    private getPreferenceRepo(): Repository<any> | null {
        if (!this.dataSource) return null;
        try {
            return this.dataSource.getRepository('UserPreference');
        } catch {
            return null;
        }
    }

    /**
     * Obtém as preferências de notificação do usuário a partir da tabela UserPreference
     * (com fallback em memória caso o repositório não esteja carregado).
     */
    async obterPreferenciasUsuario(userId: string): Promise<NotificationUserPreferences> {
        const defaults: NotificationUserPreferences = {
            ...DEFAULT_NOTIFICATION_PREFERENCES,
            mutedTypes: [...DEFAULT_NOTIFICATION_PREFERENCES.mutedTypes],
        };
        if (!userId) return defaults;

        const prefRepo = this.getPreferenceRepo();
        if (prefRepo) {
            try {
                const rows: Array<{ code?: string; value?: string }> = await prefRepo.find({
                    where: { userId },
                });
                const map = new Map<string, string>();
                for (const row of rows || []) {
                    if (row?.code) map.set(row.code, row.value ?? '');
                }
                const resolved: NotificationUserPreferences = {
                    enabled: this.parseBoolean(map.get(NOTIFICATION_PREF_CODES.ENABLED), defaults.enabled),
                    displayMode: this.parseDisplayMode(map.get(NOTIFICATION_PREF_CODES.DISPLAY_MODE)),
                    pushEnabled: this.parseBoolean(map.get(NOTIFICATION_PREF_CODES.PUSH_ENABLED), defaults.pushEnabled),
                    soundEnabled: this.parseBoolean(map.get(NOTIFICATION_PREF_CODES.SOUND_ENABLED), defaults.soundEnabled),
                    mutedTypes: this.parseMutedTypes(map.get(NOTIFICATION_PREF_CODES.MUTED_TYPES)),
                };
                this.fallbackPrefs.set(userId, resolved);
                return resolved;
            } catch {
                // Usa fallback em memória se a tabela ainda não estiver disponível
            }
        }

        const cached = this.fallbackPrefs.get(userId);
        return cached
            ? { ...cached, mutedTypes: [...cached.mutedTypes] }
            : defaults;
    }

    /**
     * Atualiza e persiste as preferências de notificação do usuário.
     */
    async atualizarPreferenciasUsuario(
        userId: string,
        updates: Partial<NotificationUserPreferences>,
    ): Promise<NotificationUserPreferences> {
        const current = await this.obterPreferenciasUsuario(userId);
        const next: NotificationUserPreferences = {
            enabled: updates.enabled !== undefined ? Boolean(updates.enabled) : current.enabled,
            displayMode: updates.displayMode ? this.parseDisplayMode(updates.displayMode) : current.displayMode,
            pushEnabled: updates.pushEnabled !== undefined ? Boolean(updates.pushEnabled) : current.pushEnabled,
            soundEnabled: updates.soundEnabled !== undefined ? Boolean(updates.soundEnabled) : current.soundEnabled,
            mutedTypes: Array.isArray(updates.mutedTypes)
                ? Array.from(new Set(updates.mutedTypes.map(t => String(t).trim().toUpperCase()).filter(Boolean)))
                : current.mutedTypes,
        };

        this.fallbackPrefs.set(userId, next);

        const prefRepo = this.getPreferenceRepo();
        if (prefRepo && userId) {
            const entries: Array<[string, string]> = [
                [NOTIFICATION_PREF_CODES.ENABLED, String(next.enabled)],
                [NOTIFICATION_PREF_CODES.DISPLAY_MODE, next.displayMode],
                [NOTIFICATION_PREF_CODES.PUSH_ENABLED, String(next.pushEnabled)],
                [NOTIFICATION_PREF_CODES.SOUND_ENABLED, String(next.soundEnabled)],
                [NOTIFICATION_PREF_CODES.MUTED_TYPES, JSON.stringify(next.mutedTypes)],
            ];
            for (const [code, value] of entries) {
                try {
                    const existing = await prefRepo.findOne({ where: { userId, code } });
                    if (existing) {
                        existing.value = value;
                        await prefRepo.save(existing);
                    } else {
                        await prefRepo.save(prefRepo.create({ userId, code, value }));
                    }
                } catch {
                    // Ignora erro individual de persistência mantendo estado consistente em memória
                }
            }
        }

        return next;
    }

    /**
     * Cria e persiste uma nova notificação interna para um usuário,
     * respeitando suas preferências (desativação global ou categorias silenciadas).
     */
    async criarNotificacao(dados: CriarNotificacaoDto): Promise<NotificacaoInterna | null> {
        const prefs = await this.obterPreferenciasUsuario(dados.userId);
        const typeNormalized = (dados.type || 'INFO').toUpperCase();
        const isForced = Boolean(dados.metadata && typeof dados.metadata === 'object' && dados.metadata.force === true);

        if (!isForced) {
            if (!prefs.enabled) {
                this.logger.debug(`Notificação "${dados.title}" suprimida para ${dados.userId} (notificações desativadas pelo usuário).`);
                return null;
            }
            if (prefs.mutedTypes.includes(typeNormalized)) {
                this.logger.debug(`Notificação "${dados.title}" (${typeNormalized}) suprimida para ${dados.userId} (categoria silenciada).`);
                return null;
            }
        }

        const notif = this.notifRepo.create({
            userId: dados.userId,
            title: dados.title,
            message: dados.message,
            type: typeNormalized,
            actionUrl: dados.actionUrl,
            metadata: dados.metadata ? (typeof dados.metadata === 'string' ? dados.metadata : JSON.stringify(dados.metadata)) : undefined,
            read: false,
        });

        const saved = await this.notifRepo.save(notif);
        this.logger.log(`Notificação criada para o usuário ${dados.userId}: "${dados.title}"`);
        return saved;
    }

    /**
     * Retorna lista de notificações do usuário ordenadas pelas mais recentes,
     * respeitando categorias silenciadas e ativação geral nas preferências.
     */
    async listarNotificacoes(userId: string, limite = 30): Promise<NotificacaoInterna[]> {
        const prefs = await this.obterPreferenciasUsuario(userId);
        if (!prefs.enabled) return [];

        const list = await this.notifRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limite,
        });

        if (prefs.mutedTypes.length === 0) return list;
        return list.filter(n => !prefs.mutedTypes.includes((n.type || 'INFO').toUpperCase()));
    }

    /**
     * Retorna a quantidade de notificações não lidas respeitando preferências do usuário.
     */
    async contarNaoLidas(userId: string): Promise<number> {
        const prefs = await this.obterPreferenciasUsuario(userId);
        if (!prefs.enabled) return 0;

        if (prefs.mutedTypes.length === 0) {
            return await this.notifRepo.count({
                where: { userId, read: false },
            });
        }

        const unreadList = await this.notifRepo.find({
            where: { userId, read: false },
            select: ['id', 'type'],
        });
        return unreadList.filter(n => !prefs.mutedTypes.includes((n.type || 'INFO').toUpperCase())).length;
    }

    /**
     * Marca uma notificação específica como lida
     */
    async marcarComoLida(notificacaoId: string, userId: string): Promise<boolean> {
        const notif = await this.notifRepo.findOne({
            where: { id: notificacaoId, userId },
        });

        if (!notif) return false;
        notif.read = true;
        await this.notifRepo.save(notif);
        return true;
    }

    /**
     * Marca todas as notificações do usuário como lidas
     */
    async marcarTodasComoLidas(userId: string): Promise<number> {
        const result = await this.notifRepo.update(
            { userId, read: false },
            { read: true }
        );
        return result.affected || 0;
    }

    /**
     * Salva ou atualiza uma PushSubscription Web Push para o usuário
     */
    async salvarPushSubscription(userId: string, subscription: { endpoint: string; keys?: { p256dh?: string; auth?: string }; userAgent?: string }): Promise<WebPushSubscription> {
        let sub = await this.pushRepo.findOne({
            where: { userId, endpoint: subscription.endpoint },
        });

        if (!sub) {
            sub = this.pushRepo.create({
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys?.p256dh,
                auth: subscription.keys?.auth,
                userAgent: subscription.userAgent,
            });
        } else {
            sub.p256dh = subscription.keys?.p256dh || sub.p256dh;
            sub.auth = subscription.keys?.auth || sub.auth;
            sub.userAgent = subscription.userAgent || sub.userAgent;
        }

        return await this.pushRepo.save(sub);
    }
}
