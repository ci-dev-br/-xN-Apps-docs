import { Column, Entity, Index } from "typeorm";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema })
export class DirectMessage extends FullAuditedEntity {
    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID da conversa' })
    conversationId?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do usuário remetente' })
    senderId?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Nome do remetente' })
    senderName?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Foto/Avatar do remetente' })
    senderPhoto?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do usuário destinatário' })
    recipientId?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Conteúdo cifrado em AES-256 no cliente (ilegível no banco)' })
    encryptedContent?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'IV ou Salt de derivação do AES' })
    iv?: string;

    @Column({ type: 'jsonb', nullable: true })
    @ApiProperty({ description: 'Anexos de arquivos (lista de { name, url, size, type })' })
    attachments?: any;

    @Column({ default: false })
    @ApiProperty({ description: 'Status de leitura da mensagem' })
    read?: boolean;
}