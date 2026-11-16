import { ApiProperty } from "@nestjs/swagger";

export class StartConversationDto {
    @ApiProperty({
        description: 'ID do usuário destinatário para iniciar ou abrir a conversa',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    targetUserId: string;
}

export class SendMessageDto {
    @ApiProperty({
        description: 'Conteúdo criptografado no cliente via AES-256',
        example: 'U2FsdGVkX1+...',
    })
    encryptedContent: string;

    @ApiProperty({
        description: 'Lista de anexos da mensagem',
        required: false,
        isArray: true,
        type: 'object',
    })
    attachments?: any[];

    @ApiProperty({
        description: 'Vetor de inicialização (IV) opcional utilizado na cifra',
        required: false,
    })
    iv?: string;
}

export class ConversationResponseDto {
    @ApiProperty({ description: 'Identificador do canal ou ID interno da conversa' })
    id: string;

    @ApiProperty({ description: 'Hash determinístico único do canal', required: false })
    channelHash?: string;

    @ApiProperty({ description: 'ID do contato/destinatário' })
    contactId: string;

    @ApiProperty({ description: 'Nome do contato' })
    contactName: string;

    @ApiProperty({ description: 'Foto/Avatar do contato', required: false, nullable: true })
    contactPhoto?: string;

    @ApiProperty({ description: 'Última mensagem cifrada', required: false, nullable: true })
    lastMessageEncrypted?: string;

    @ApiProperty({ description: 'Data da última mensagem ou de criação', required: false })
    lastMessageAt?: Date;

    @ApiProperty({ description: 'Contador de mensagens não lidas', required: false })
    unreadCount?: number;
}
