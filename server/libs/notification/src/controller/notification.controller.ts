import { Body, Controller, Get, Param, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { NotificationService } from "../services/notification.service";

@ApiTags('Notification')
@Controller('Notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) {}

    /**
     * Retorna a lista de notificações internas do usuário autenticado e total não lidas
     */
    @Get('My')
    @ApiOperation({ operationId: 'NotificationGetMy' })
    async getMyNotifications(@Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado para acessar as notificações.');
        }

        const [notifications, unreadCount] = await Promise.all([
            this.notificationService.listarNotificacoes(userId, 30),
            this.notificationService.contarNaoLidas(userId),
        ]);

        return {
            unreadCount,
            notifications,
        };
    }

    /**
     * Marca uma notificação específica como lida
     */
    @Post(':id/Read')
    @ApiOperation({ operationId: 'NotificationMarkAsRead' })
    async markAsRead(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }

        const success = await this.notificationService.marcarComoLida(id, userId);
        return { success };
    }

    /**
     * Marca todas as notificações do usuário como lidas
     */
    @Post('ReadAll')
    @ApiOperation({ operationId: 'NotificationMarkAllAsRead' })
    async markAllAsRead(@Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }

        const affected = await this.notificationService.marcarTodasComoLidas(userId);
        return { success: true, count: affected };
    }

    /**
     * Registra ou atualiza a PushSubscription do navegador (Web Push)
     */
    @Post('Push/Subscribe')
    @ApiOperation({ operationId: 'NotificationPushSubscribe' })
    async subscribePush(@Body() body: any, @Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }

        const sub = await this.notificationService.salvarPushSubscription(userId, {
            endpoint: body.endpoint,
            keys: body.keys,
            userAgent: req.headers['user-agent'],
        });

        return { success: true, id: sub.id };
    }

    /**
     * Dispara uma notificação interna de teste para o usuário conectado
     */
    @Post('Test')
    @ApiOperation({ operationId: 'NotificationSendTest' })
    async sendTestNotification(@Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }

        const notif = await this.notificationService.criarNotificacao({
            userId,
            title: 'Notificação de Teste',
            message: 'O sistema de notificações internas e push está operando com sucesso!',
            type: 'SISTEMA',
            actionUrl: '/meus-apps/apps',
        });

        return {
            success: true,
            notification: notif,
        };
    }
}
