import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificacaoInterna } from "../models/notificacao-interna.entity";
import { WebPushSubscription } from "../models/web-push-subscription.entity";

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

    constructor(
        @InjectRepository(NotificacaoInterna)
        private readonly notifRepo: Repository<NotificacaoInterna>,
        @InjectRepository(WebPushSubscription)
        private readonly pushRepo: Repository<WebPushSubscription>,
    ) {}

    /**
     * Cria e persiste uma nova notificação interna para um usuário
     */
    async criarNotificacao(dados: CriarNotificacaoDto): Promise<NotificacaoInterna> {
        const notif = this.notifRepo.create({
            userId: dados.userId,
            title: dados.title,
            message: dados.message,
            type: dados.type || 'INFO',
            actionUrl: dados.actionUrl,
            metadata: dados.metadata ? (typeof dados.metadata === 'string' ? dados.metadata : JSON.stringify(dados.metadata)) : undefined,
            read: false,
        });

        const saved = await this.notifRepo.save(notif);
        this.logger.log(`Notificação criada para o usuário ${dados.userId}: "${dados.title}"`);
        return saved;
    }

    /**
     * Retorna lista de notificações do usuário ordenadas pelas mais recentes
     */
    async listarNotificacoes(userId: string, limite = 30): Promise<NotificacaoInterna[]> {
        return await this.notifRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limite,
        });
    }

    /**
     * Retorna a quantidade de notificações não lidas
     */
    async contarNaoLidas(userId: string): Promise<number> {
        return await this.notifRepo.count({
            where: { userId, read: false },
        });
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