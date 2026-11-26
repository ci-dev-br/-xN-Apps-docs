import { Column, Entity, Index } from "typeorm";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema })
export class DirectMessage extends FullAuditedEntity {
    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'Hash criptográfico do canal da conversa (conecta as mensagens)' })
    channelHash?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'Hash único SHA-256 desta mensagem' })
    messageHash?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'Hash da mensagem anterior na cadeia (hash chain / encadeamento de hashes)' })
    previousMessageHash?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'Hash cego do participante remetente (protegido no banco)' })
    senderHash?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'Hash cego do participante destinatário (protegido no banco)' })
    recipientHash?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Conteúdo cifrado em AES-256 no cliente (ilegível no banco)' })
    encryptedContent?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Metadados protegidos do remetente (cifrados no banco)' })
    encryptedMetadata?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'IV ou Salt de derivação do AES' })
    iv?: string;

    @Column({ type: 'jsonb', nullable: true })
    @ApiProperty({ description: 'Anexos de arquivos (lista de { name, url, size, type })' })
    attachments?: any;

    @Column({ default: false })
    @ApiProperty({ description: 'Status de leitura da mensagem' })
    read?: boolean;

    // Campos legados mantidos como opcionais/nullable para compatibilidade
    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID da conversa (legado)' })
    conversationId?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do usuário remetente (legado)' })
    senderId?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Nome do remetente (legado)' })
    senderName?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Foto/Avatar do remetente (legado)' })
    senderPhoto?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do usuário destinatário (legado)' })
    recipientId?: string;
}
