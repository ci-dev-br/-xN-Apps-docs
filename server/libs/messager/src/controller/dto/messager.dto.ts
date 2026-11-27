import { ApiProperty } from "@nestjs/swagger";

export class MessageAttachmentDto {
    @ApiProperty({ description: 'Nome do arquivo anexo' })
    name: string;

    @ApiProperty({ description: 'URL pública do anexo', required: false })
    url?: string;

    @ApiProperty({ description: 'Tamanho em bytes', required: false })
    size?: number;

    @ApiProperty({ description: 'MIME type do arquivo', required: false })
    type?: string;

    @ApiProperty({ description: 'Conteúdo em Data URL (base64)', required: false })
    data?: string;
}

export class StartConversationDto {
    @ApiProperty({
        description: 'ID do usuário destinatário para iniciar ou abrir a conversa',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    targetUserId: string;
}

export class ListUsersDto {
    @ApiProperty({
        description: 'Termo opcional para filtrar usuários por nome ou login',
        required: false,
    })
    search?: string;
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
        type: MessageAttachmentDto,
    })
    attachments?: MessageAttachmentDto[];

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

    @ApiProperty({ description: 'Título da conversa', required: false })
    title?: string;

    @ApiProperty({ description: 'ID do contato/destinatário' })
    contactId: string;

    @ApiProperty({ description: 'Nome do contato' })
    contactName: string;

    @ApiProperty({ description: 'Foto/Avatar do contato', required: false, nullable: true })
    contactPhoto?: string;

    @ApiProperty({ description: 'Última mensagem cifrada', required: false, nullable: true })
    lastMessageEncrypted?: string;

    @ApiProperty({ description: 'Hash da última mensagem', required: false })
    lastMessageHash?: string;

    @ApiProperty({ description: 'Data da última mensagem ou de criação', required: false })
    lastMessageAt?: Date;

    @ApiProperty({ description: 'Contador de mensagens não lidas', required: false })
    unreadCount?: number;
}

export class DirectMessageResponseDto {
    @ApiProperty({ description: 'ID interno da mensagem', required: false })
    internalId?: string;

    @ApiProperty({ description: 'ID alternativo da mensagem', required: false })
    id?: string;

    @ApiProperty({ description: 'Hash do canal da conversa', required: false })
    channelHash?: string;

    @ApiProperty({ description: 'ID da conversa / canal', required: false })
    conversationId?: string;

    @ApiProperty({ description: 'Hash SHA-256 da mensagem', required: false })
    messageHash?: string;

    @ApiProperty({ description: 'Hash da mensagem anterior na cadeia', required: false })
    previousMessageHash?: string;

    @ApiProperty({ description: 'Conteúdo cifrado em AES-256', required: false })
    encryptedContent?: string;

    @ApiProperty({ description: 'IV utilizado na cifra', required: false })
    iv?: string;

    @ApiProperty({
        description: 'Anexos da mensagem',
        required: false,
        isArray: true,
        type: MessageAttachmentDto,
    })
    attachments?: MessageAttachmentDto[];

    @ApiProperty({ description: 'Status de leitura', required: false })
    read?: boolean;

    @ApiProperty({ description: 'Data de criação da mensagem', required: false })
    createdAt?: Date;

    @ApiProperty({ description: 'ID do remetente (decodificado em memória)', required: false })
    senderId?: string;

    @ApiProperty({ description: 'Nome do remetente (decodificado em memória)', required: false })
    senderName?: string;

    @ApiProperty({ description: 'Foto do remetente (decodificada em memória)', required: false })
    senderPhoto?: string;

    @ApiProperty({ description: 'ID do destinatário (decodificado em memória)', required: false })
    recipientId?: string;
}

export class AvailableUserResponseDto {
    @ApiProperty({ description: 'ID do usuário' })
    id: string;

    @ApiProperty({ description: 'Login/Username do usuário' })
    username: string;

    @ApiProperty({ description: 'Nome de exibição do usuário' })
    name: string;

    @ApiProperty({ description: 'URL da foto do usuário', required: false, nullable: true })
    photoUrl?: string;
}
