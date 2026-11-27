import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';
import { computeChannelHash, computeParticipantHash, encryptMetadata } from '../util/crypto-hash.util';

describe('MessageService', () => {
    const user1Id = '11111111-1111-4111-8111-111111111111';
    const user2Id = '22222222-2222-4222-8222-222222222222';
    const channelHash = computeChannelHash(user1Id, user2Id);
    const convInternalId = '33333333-3333-4333-8333-333333333333';

    let msgRepo: any;
    let convRepo: any;
    let notificationService: any;
    let dataSource: any;
    let service: MessageService;

    beforeEach(() => {
        msgRepo = {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue({ affected: 0 }),
            create: jest.fn((data) => ({ ...data })),
            save: jest.fn(async (data) => ({
                internalId: '44444444-4444-4444-8444-444444444444',
                createdAt: new Date('2026-11-27T00:00:00Z'),
                ...data,
            })),
        };
        convRepo = {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            create: jest.fn((data) => ({ ...data })),
            save: jest.fn(async (data) => ({ internalId: convInternalId, ...data })),
        };
        notificationService = {
            criarNotificacao: jest.fn().mockResolvedValue({ id: 'notif-1' }),
        };
        dataSource = {
            getRepository: jest.fn(),
        };

        service = new MessageService(msgRepo, convRepo, notificationService, dataSource);
    });

    it('não deve consultar internalId (uuid) no TypeORM quando conversationId for um channelHash', async () => {
        const p1Hash = computeParticipantHash(user1Id);
        const p2Hash = computeParticipantHash(user2Id);
        convRepo.findOne.mockResolvedValue({
            internalId: convInternalId,
            channelHash,
            participant1Hash: p1Hash,
            participant2Hash: p2Hash,
            encryptedMetadataUser1: encryptMetadata({ id: user1Id, name: 'Usuário 1' }),
            encryptedMetadataUser2: encryptMetadata({ id: user2Id, name: 'Usuário 2' }),
            unreadCountUser1: 0,
            unreadCountUser2: 0,
        });

        const saved = await service.enviarMensagem({
            conversationId: channelHash,
            senderId: user1Id,
            senderName: 'Usuário 1',
            encryptedContent: 'U2FsdGVkX1+teste',
            attachments: [],
        });

        expect(convRepo.findOne).toHaveBeenCalledWith({
            where: [{ channelHash }],
        });
        expect(saved.senderId).toBe(user1Id);
        expect(saved.recipientId).toBe(user2Id);
        expect(saved.conversationId).toBe(channelHash);
        expect(saved.previousMessageHash).toBe('GENESIS');
        expect(saved.messageHash).toBeTruthy();
        expect(notificationService.criarNotificacao).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: user2Id,
                type: 'MENSAGEM',
                actionUrl: `/Mensagens?conversationId=${channelHash}`,
            }),
        );
    });

    it('deve aceitar UUID em conversationId e incluir internalId na busca', async () => {
        const p1Hash = computeParticipantHash(user1Id);
        const p2Hash = computeParticipantHash(user2Id);
        convRepo.findOne.mockResolvedValue({
            internalId: convInternalId,
            channelHash,
            participant1Hash: p1Hash,
            participant2Hash: p2Hash,
            encryptedMetadataUser1: encryptMetadata({ id: user1Id, name: 'Usuário 1' }),
            encryptedMetadataUser2: encryptMetadata({ id: user2Id, name: 'Usuário 2' }),
            unreadCountUser1: 0,
            unreadCountUser2: 0,
        });

        await service.listarMensagens(convInternalId, user1Id);

        expect(convRepo.findOne).toHaveBeenCalledWith({
            where: [
                { channelHash: convInternalId },
                { internalId: convInternalId },
            ],
        });
    });

    it('deve rejeitar envio de mensagem sem conteúdo e sem anexos', async () => {
        await expect(
            service.enviarMensagem({
                conversationId: channelHash,
                senderId: user1Id,
                encryptedContent: '   ',
                attachments: [],
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar remetente que não pertence à conversa', async () => {
        convRepo.findOne.mockResolvedValue({
            internalId: convInternalId,
            channelHash,
            participant1Hash: computeParticipantHash(user1Id),
            participant2Hash: computeParticipantHash(user2Id),
        });

        await expect(
            service.enviarMensagem({
                conversationId: channelHash,
                senderId: '99999999-9999-4999-8999-999999999999',
                encryptedContent: 'U2FsdGVkX1+teste',
            }),
        ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException quando conversa não existir', async () => {
        convRepo.findOne.mockResolvedValue(null);

        await expect(
            service.enviarMensagem({
                conversationId: channelHash,
                senderId: user1Id,
                encryptedContent: 'U2FsdGVkX1+teste',
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar as 100 mensagens mais recentes em ordem cronológica crescente', async () => {
        convRepo.findOne.mockResolvedValue({
            internalId: convInternalId,
            channelHash,
            participant1Hash: computeParticipantHash(user1Id),
            participant2Hash: computeParticipantHash(user2Id),
            unreadCountUser1: 0,
            unreadCountUser2: 0,
        });
        msgRepo.find.mockResolvedValue([
            {
                internalId: 'm2',
                encryptedContent: 'c2',
                encryptedMetadata: encryptMetadata({ senderId: user2Id, senderName: 'U2', recipientId: user1Id }),
            },
            {
                internalId: 'm1',
                encryptedContent: 'c1',
                encryptedMetadata: encryptMetadata({ senderId: user1Id, senderName: 'U1', recipientId: user2Id }),
            },
        ]);

        const list = await service.listarMensagens(channelHash, user1Id);

        expect(msgRepo.find).toHaveBeenCalledWith(
            expect.objectContaining({
                order: { createdAt: 'DESC' },
                take: 100,
            }),
        );
        expect(list.map((m) => m.internalId)).toEqual(['m1', 'm2']);
    });
});
