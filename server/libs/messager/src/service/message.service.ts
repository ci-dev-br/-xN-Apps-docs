import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { DirectMessage } from "../model/direct-message.entity";
import { Conversation } from "../model/conversation.entity";
import { NotificationService } from "@ci/notification";
import { User } from "@ci/auth/models/user.entity";

export interface EnviarMensagemDto {
    conversationId: string;
    senderId: string;
    senderName?: string;
    senderPhoto?: string;
    encryptedContent: string;
    attachments?: Array<{
        name: string;
        url?: string;
        size?: number;
        type?: string;
        data?: string;
    }>;
    iv?: string;
}

@Injectable()
export class MessageService {
    private readonly logger = new Logger(MessageService.name);

    constructor(
        @InjectRepository(DirectMessage)
        private readonly msgRepo: Repository<DirectMessage>,
        @InjectRepository(Conversation)
        private readonly convRepo: Repository<Conversation>,
        private readonly notificationService: NotificationService,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Lista conversas do usuário ordenadas pela data da última mensagem
     */
    async listarConversas(userId: string): Promise<any[]> {
        const conversas = await this.convRepo.find({
            where: [
                { user1Id: userId },
                { user2Id: userId },
            ],
            order: {
                lastMessageAt: 'DESC',
                createdAt: 'DESC',
            },
        });

        return conversas.map((c) => {
            const isUser1 = c.user1Id === userId;
            const contactId = isUser1 ? c.user2Id : c.user1Id;
            const contactName = isUser1 ? c.user2Name : c.user1Name;
            const contactPhoto = isUser1 ? c.user2Photo : c.user1Photo;
            const unreadCount = isUser1 ? (c.unreadCountUser1 || 0) : (c.unreadCountUser2 || 0);

            return {
                id: c.internalId,
                title: c.title || contactName || 'Conversa',
                contactId,
                contactName: contactName || 'Usuário',
                contactPhoto,
                lastMessageEncrypted: c.lastMessageEncrypted,
                lastMessageAt: c.lastMessageAt || c.createdAt,
                unreadCount,
            };
        });
    }

    /**
     * Obtém uma conversa existente entre dois usuários ou cria uma nova
     */
    async obterOuCriarConversa(currentUserId: string, targetUserId: string, currentUser?: any): Promise<any> {
        if (!targetUserId || targetUserId === currentUserId) {
            throw new BadRequestException('Destinatário inválido para iniciar conversa.');
        }

        // Procura conversa existente em ambas as direções
        let conv = await this.convRepo.findOne({
            where: [
                { user1Id: currentUserId, user2Id: targetUserId },
                { user1Id: targetUserId, user2Id: currentUserId },
            ],
        });

        if (conv) {
            const isUser1 = conv.user1Id === currentUserId;
            return {
                id: conv.internalId,
                contactId: targetUserId,
                contactName: isUser1 ? conv.user2Name : conv.user1Name,
                contactPhoto: isUser1 ? conv.user2Photo : conv.user1Photo,
                lastMessageEncrypted: conv.lastMessageEncrypted,
                lastMessageAt: conv.lastMessageAt,
            };
        }

        // Busca dados do targetUser no banco
        const userRepo = this.dataSource.getRepository(User);
        const targetUser = await userRepo.findOne({
            where: { id: targetUserId },
            relations: ['photo'],
        });

        if (!targetUser) {
            throw new NotFoundException('Usuário destinatário não encontrado.');
        }

        const targetName = targetUser.surname || targetUser.fullName || targetUser.username || 'Usuário';
        const targetPhoto = targetUser.photo?.internalId ? `/Storage/Photo/${targetUser.photo.internalId}` : (targetUser.photo as any)?.url;

        const currentName = currentUser?.surname || currentUser?.fullName || currentUser?.username || 'Usuário';
        const currentPhoto = currentUser?.photo?.internalId ? `/Storage/Photo/${currentUser.photo.internalId}` : (currentUser?.photo as any)?.url;

        // Cria a conversa
        conv = this.convRepo.create({
            user1Id: currentUserId,
            user1Name: currentName,
            user1Photo: currentPhoto,
            user2Id: targetUserId,
            user2Name: targetName,
            user2Photo: targetPhoto,
            title: `${currentName} & ${targetName}`,
            unreadCountUser1: 0,
            unreadCountUser2: 0,
        });

        const saved = await this.convRepo.save(conv);

        return {
            id: saved.internalId,
            contactId: targetUserId,
            contactName: targetName,
            contactPhoto: targetPhoto,
            lastMessageEncrypted: null,
            lastMessageAt: saved.createdAt,
        };
    }

    /**
     * Lista mensagens da conversa e marca como lidas as mensagens destinadas ao usuário atual
     */
    async listarMensagens(conversationId: string, currentUserId: string): Promise<DirectMessage[]> {
        const conv = await this.convRepo.findOne({
            where: { internalId: conversationId },
        });

        if (!conv) {
            throw new NotFoundException('Conversa não encontrada.');
        }

        const mensagens = await this.msgRepo.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
            take: 100,
        });

        // Marca mensagens não lidas como lidas
        await this.msgRepo.update(
            { conversationId, recipientId: currentUserId, read: false },
            { read: true }
        );

        // Zera contador na conversa
        if (conv.user1Id === currentUserId && (conv.unreadCountUser1 || 0) > 0) {
            conv.unreadCountUser1 = 0;
            await this.convRepo.save(conv);
        } else if (conv.user2Id === currentUserId && (conv.unreadCountUser2 || 0) > 0) {
            conv.unreadCountUser2 = 0;
            await this.convRepo.save(conv);
        }

        return mensagens;
    }

    /**
     * Envia mensagem criptografada e dispara notificação interna/push para o destinatário
     */
    async enviarMensagem(dados: EnviarMensagemDto): Promise<DirectMessage> {
        const conv = await this.convRepo.findOne({
            where: { internalId: dados.conversationId },
        });

        if (!conv) {
            throw new NotFoundException('Conversa não encontrada.');
        }

        // Descobre quem é o destinatário
        const recipientId = conv.user1Id === dados.senderId ? conv.user2Id : conv.user1Id;
        if (!recipientId) {
            throw new BadRequestException('Destinatário da conversa indefinido.');
        }

        const msg = this.msgRepo.create({
            conversationId: dados.conversationId,
            senderId: dados.senderId,
            senderName: dados.senderName || 'Participante',
            senderPhoto: dados.senderPhoto,
            recipientId,
            encryptedContent: dados.encryptedContent,
            iv: dados.iv,
            attachments: dados.attachments || [],
            read: false,
        });

        const savedMsg = await this.msgRepo.save(msg);

        // Atualiza a conversa
        conv.lastMessageEncrypted = dados.encryptedContent;
        conv.lastMessageAt = new Date();
        if (conv.user1Id === recipientId) {
            conv.unreadCountUser1 = (conv.unreadCountUser1 || 0) + 1;
        } else {
            conv.unreadCountUser2 = (conv.unreadCountUser2 || 0) + 1;
        }
        await this.convRepo.save(conv);

        // Dispara notificação interna para o destinatário
        try {
            await this.notificationService.criarNotificacao({
                userId: recipientId,
                title: `Nova mensagem de ${dados.senderName || 'um contato'}`,
                message: 'Você recebeu uma nova mensagem criptografada ponta-a-ponta.',
                type: 'MENSAGEM',
                actionUrl: '/Mensagens',
                metadata: {
                    conversationId: dados.conversationId,
                    senderId: dados.senderId,
                },
            });
        } catch (err: any) {
            this.logger.warn(`Não foi possível enviar notificação interna: ${err?.message}`);
        }

        return savedMsg;
    }

    /**
     * Lista usuários cadastrados disponíveis para iniciar conversas
     */
    async listarUsuarios(currentUserId: string, search?: string): Promise<any[]> {
        const userRepo = this.dataSource.getRepository(User);
        const qb = userRepo.createQueryBuilder('u')
            .leftJoinAndSelect('u.photo', 'photo')
            .where('u.id != :currentUserId', { currentUserId });

        if (search && search.trim().length > 0) {
            qb.andWhere('(LOWER(u.username) LIKE :s OR LOWER(u.surname) LIKE :s OR LOWER(u.fullName) LIKE :s)', {
                s: `%${search.toLowerCase().trim()}%`,
            });
        }

        const users = await qb.take(20).getMany();

        return users.map((u) => ({
            id: u.id,
            username: u.username,
            name: u.surname || u.fullName || u.username,
            photoUrl: u.photo?.internalId ? `/Storage/Photo/${u.photo.internalId}` : (u.photo as any)?.url,
        }));
    }
}