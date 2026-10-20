import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { DirectMessage } from "../model/direct-message.entity";
import { Conversation } from "../model/conversation.entity";
import { NotificationService } from "@ci/notification";
import { User } from "@ci/auth/models/user.entity";
import {
    computeChannelHash,
    computeParticipantHash,
    computeMessageHash,
    encryptMetadata,
    decryptMetadata,
} from "../util/crypto-hash.util";

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
     * Lista conversas do usuário ordenadas pela data da última mensagem.
     * Consulta protegida por hashes cegos dos participantes (sem expor quem conversa com quem no banco).
     */
    async listarConversas(userId: string): Promise<any[]> {
        const participantHash = computeParticipantHash(userId);

        const conversas = await this.convRepo.find({
            where: [
                { participant1Hash: participantHash },
                { participant2Hash: participantHash },
                { user1Id: userId },
                { user2Id: userId },
            ],
            order: {
                lastMessageAt: 'DESC',
                createdAt: 'DESC',
            },
        });

        return conversas.map((c) => {
            const isUser1 = c.participant1Hash === participantHash || c.user1Id === userId;
            const myMeta = isUser1
                ? (decryptMetadata(c.encryptedMetadataUser1) || { id: c.user1Id, name: c.user1Name, photo: c.user1Photo })
                : (decryptMetadata(c.encryptedMetadataUser2) || { id: c.user2Id, name: c.user2Name, photo: c.user2Photo });

            const contactMeta = isUser1
                ? (decryptMetadata(c.encryptedMetadataUser2) || { id: c.user2Id, name: c.user2Name, photo: c.user2Photo })
                : (decryptMetadata(c.encryptedMetadataUser1) || { id: c.user1Id, name: c.user1Name, photo: c.user1Photo });

            const unreadCount = isUser1 ? (c.unreadCountUser1 || 0) : (c.unreadCountUser2 || 0);

            return {
                id: c.channelHash || c.internalId,
                channelHash: c.channelHash,
                title: contactMeta?.name || c.title || 'Conversa',
                contactId: contactMeta?.id,
                contactName: contactMeta?.name || 'Usuário',
                contactPhoto: contactMeta?.photo,
                lastMessageEncrypted: c.lastMessageEncrypted,
                lastMessageAt: c.lastMessageAt || c.createdAt,
                lastMessageHash: c.lastMessageHash,
                unreadCount,
            };
        });
    }

    /**
     * Obtém uma conversa existente entre dois usuários ou cria uma nova com proteção criptográfica
     * de metadados e anonimização de relacionamentos no banco de dados.
     */
    async obterOuCriarConversa(currentUserId: string, targetUserId: string, currentUser?: any): Promise<any> {
        if (!targetUserId || targetUserId === currentUserId) {
            throw new BadRequestException('Destinatário inválido para iniciar conversa.');
        }

        const channelHash = computeChannelHash(currentUserId, targetUserId);
        const participant1Hash = computeParticipantHash(currentUserId);
        const participant2Hash = computeParticipantHash(targetUserId);

        // Procura conversa existente pelo hash do canal ou por campos legados
        let conv = await this.convRepo.findOne({
            where: [
                { channelHash },
                { user1Id: currentUserId, user2Id: targetUserId },
                { user1Id: targetUserId, user2Id: currentUserId },
            ],
        });

        if (conv) {
            const isUser1 = conv.participant1Hash === participant1Hash || conv.user1Id === currentUserId;
            let contactMeta = isUser1
                ? (decryptMetadata(conv.encryptedMetadataUser2) || { id: conv.user2Id, name: conv.user2Name, photo: conv.user2Photo })
                : (decryptMetadata(conv.encryptedMetadataUser1) || { id: conv.user1Id, name: conv.user1Name, photo: conv.user1Photo });

            // Se for conversa legada sem hashes, migra os campos protegidos
            if (!conv.channelHash) {
                conv.channelHash = channelHash;
                conv.participant1Hash = isUser1 ? participant1Hash : participant2Hash;
                conv.participant2Hash = isUser1 ? participant2Hash : participant1Hash;
                if (!conv.encryptedMetadataUser1 && conv.user1Id) {
                    conv.encryptedMetadataUser1 = encryptMetadata({
                        id: conv.user1Id,
                        name: conv.user1Name,
                        photo: conv.user1Photo,
                    });
                }
                if (!conv.encryptedMetadataUser2 && conv.user2Id) {
                    conv.encryptedMetadataUser2 = encryptMetadata({
                        id: conv.user2Id,
                        name: conv.user2Name,
                        photo: conv.user2Photo,
                    });
                }
                await this.convRepo.save(conv);
            }

            return {
                id: conv.channelHash || conv.internalId,
                channelHash: conv.channelHash,
                contactId: contactMeta?.id || targetUserId,
                contactName: contactMeta?.name || 'Usuário',
                contactPhoto: contactMeta?.photo,
                lastMessageEncrypted: conv.lastMessageEncrypted,
                lastMessageAt: conv.lastMessageAt || conv.createdAt,
            };
        }

        // Busca dados do targetUser no banco para cifrar nos metadados
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

        // Cria a conversa protegida: identidades e nomes são cifrados em metadados; colunas em texto plano ficam nulas
        conv = this.convRepo.create({
            channelHash,
            participant1Hash,
            participant2Hash,
            encryptedMetadataUser1: encryptMetadata({
                id: currentUserId,
                name: currentName,
                photo: currentPhoto,
            }),
            encryptedMetadataUser2: encryptMetadata({
                id: targetUserId,
                name: targetName,
                photo: targetPhoto,
            }),
            lastMessageEncrypted: undefined,
            unreadCountUser1: 0,
            unreadCountUser2: 0,
        });

        const saved = await this.convRepo.save(conv);

        return {
            id: saved.channelHash || saved.internalId,
            channelHash: saved.channelHash,
            contactId: targetUserId,
            contactName: targetName,
            contactPhoto: targetPhoto,
            lastMessageEncrypted: null,
            lastMessageAt: saved.createdAt,
        };
    }

    /**
     * Lista mensagens da conversa e marca como lidas as mensagens destinadas ao usuário atual.
     * Encadeia e descriptografa metadados dos remetentes em memória.
     */
    async listarMensagens(conversationId: string, currentUserId: string): Promise<DirectMessage[]> {
        const conv = await this.convRepo.findOne({
            where: [
                { channelHash: conversationId },
                { internalId: conversationId },
            ],
        });

        if (!conv) {
            throw new NotFoundException('Conversa não encontrada.');
        }

        const currentPartHash = computeParticipantHash(currentUserId);
        const isUser1 = conv.participant1Hash === currentPartHash || conv.user1Id === currentUserId;
        const isUser2 = conv.participant2Hash === currentPartHash || conv.user2Id === currentUserId;

        if (!isUser1 && !isUser2) {
            throw new ForbiddenException('Acesso não autorizado a esta conversa.');
        }

        // Busca mensagens associadas ao canal da conversa
        const targetChannelHash = conv.channelHash || conversationId;
        const mensagens = await this.msgRepo.find({
            where: [
                { channelHash: targetChannelHash },
                { conversationId: conv.internalId },
                { conversationId: targetChannelHash },
            ],
            order: { createdAt: 'ASC' },
            take: 100,
        });

        // Marca mensagens não lidas destinadas ao usuário atual como lidas
        await this.msgRepo.update(
            [
                { channelHash: targetChannelHash, recipientHash: currentPartHash, read: false },
                { conversationId: conv.internalId, recipientId: currentUserId, read: false },
            ],
            { read: true }
        );

        // Zera contador de não lidas na conversa
        if (isUser1 && (conv.unreadCountUser1 || 0) > 0) {
            conv.unreadCountUser1 = 0;
            await this.convRepo.save(conv);
        } else if (isUser2 && (conv.unreadCountUser2 || 0) > 0) {
            conv.unreadCountUser2 = 0;
            await this.convRepo.save(conv);
        }

        // Decodifica metadados em memória para o cliente autenticado
        return mensagens.map((m) => {
            if (m.encryptedMetadata) {
                const meta = decryptMetadata(m.encryptedMetadata);
                if (meta) {
                    m.senderId = meta.senderId;
                    m.senderName = meta.senderName;
                    m.senderPhoto = meta.senderPhoto;
                    m.recipientId = meta.recipientId;
                }
            }
            m.conversationId = targetChannelHash;
            return m;
        });
    }

    /**
     * Envia mensagem com proteção total:
     * - Encadeamento criptográfico por hashes (hash chaining: previousMessageHash -> messageHash)
     * - Hash determinístico do canal (channelHash)
     * - Hashes cegos dos participantes (senderHash, recipientHash)
     * - Metadados cifrados com AES (encryptedMetadata)
     * - Identidades em texto plano não são gravadas no banco
     */
    async enviarMensagem(dados: EnviarMensagemDto): Promise<DirectMessage> {
        const conv = await this.convRepo.findOne({
            where: [
                { channelHash: dados.conversationId },
                { internalId: dados.conversationId },
            ],
        });

        if (!conv) {
            throw new NotFoundException('Conversa não encontrada.');
        }

        const senderPartHash = computeParticipantHash(dados.senderId);
        const isUser1 = conv.participant1Hash === senderPartHash || conv.user1Id === dados.senderId;
        const isUser2 = conv.participant2Hash === senderPartHash || conv.user2Id === dados.senderId;

        if (!isUser1 && !isUser2) {
            throw new ForbiddenException('Remetente não pertence a esta conversa.');
        }

        // Descobre metadados do destinatário apenas em memória
        const recipientMeta = isUser1
            ? (decryptMetadata(conv.encryptedMetadataUser2) || { id: conv.user2Id, name: conv.user2Name, photo: conv.user2Photo })
            : (decryptMetadata(conv.encryptedMetadataUser1) || { id: conv.user1Id, name: conv.user1Name, photo: conv.user1Photo });

        const recipientId = recipientMeta?.id;
        if (!recipientId) {
            throw new BadRequestException('Destinatário da conversa indefinido.');
        }

        const recipientPartHash = isUser1 ? conv.participant2Hash : conv.participant1Hash;
        const channelHash = conv.channelHash || computeChannelHash(dados.senderId, recipientId);

        // Busca última mensagem para encadeamento criptográfico por hashes (hash chain)
        const lastMsg = await this.msgRepo.findOne({
            where: [
                { channelHash },
                { conversationId: conv.internalId },
            ],
            order: { createdAt: 'DESC' },
        });

        const previousMessageHash = lastMsg?.messageHash || conv.lastMessageHash || 'GENESIS';
        const timestamp = Date.now();
        const messageHash = computeMessageHash(channelHash, previousMessageHash, timestamp, dados.encryptedContent);

        // Metadados do remetente e destinatário cifrados no banco
        const encryptedMetadata = encryptMetadata({
            senderId: dados.senderId,
            senderName: dados.senderName || 'Participante',
            senderPhoto: dados.senderPhoto,
            recipientId,
        });

        // Cria a mensagem protegida no banco: sem texto plano de participantes
        const msg = this.msgRepo.create({
            channelHash,
            messageHash,
            previousMessageHash,
            senderHash: senderPartHash,
            recipientHash: recipientPartHash,
            encryptedContent: dados.encryptedContent,
            encryptedMetadata,
            iv: dados.iv,
            attachments: dados.attachments || [],
            read: false,
            // Mantém colunas em texto plano como indefinidas/nulas no banco
            senderId: undefined,
            senderName: undefined,
            senderPhoto: undefined,
            recipientId: undefined,
            conversationId: channelHash,
        });

        const savedMsg = await this.msgRepo.save(msg);

        // Atualiza a conversa com o elo mais recente da hash chain
        conv.lastMessageEncrypted = dados.encryptedContent;
        conv.lastMessageHash = messageHash;
        conv.lastMessageAt = new Date(timestamp);
        if (conv.channelHash !== channelHash) {
            conv.channelHash = channelHash;
        }

        if (isUser1) {
            conv.unreadCountUser2 = (conv.unreadCountUser2 || 0) + 1;
        } else {
            conv.unreadCountUser1 = (conv.unreadCountUser1 || 0) + 1;
        }
        await this.convRepo.save(conv);

        // Dispara notificação interna/push para o destinatário em memória
        try {
            await this.notificationService.criarNotificacao({
                userId: recipientId,
                title: `Nova mensagem de ${dados.senderName || 'um contato'}`,
                message: 'Você recebeu uma nova mensagem criptografada ponta-a-ponta.',
                type: 'MENSAGEM',
                actionUrl: '/Mensagens',
                metadata: {
                    conversationId: channelHash,
                    messageHash,
                },
            });
        } catch (err: any) {
            this.logger.warn(`Não foi possível enviar notificação interna: ${err?.message}`);
        }

        // Restaura campos em memória para retorno imediato ao remetente
        savedMsg.senderId = dados.senderId;
        savedMsg.senderName = dados.senderName || 'Participante';
        savedMsg.senderPhoto = dados.senderPhoto;
        savedMsg.recipientId = recipientId;
        savedMsg.conversationId = channelHash;

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
