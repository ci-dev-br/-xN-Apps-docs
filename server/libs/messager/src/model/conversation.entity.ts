import { Column, Entity, Index } from "typeorm";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema })
export class Conversation extends FullAuditedEntity {
    @Column({ nullable: true, unique: true })
    @Index()
    @ApiProperty({ description: 'Hash determinístico único do canal (protegido no banco)' })
    channelHash?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'Hash cego do participante 1 para consulta segura' })
    participant1Hash?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'Hash cego do participante 2 para consulta segura' })
    participant2Hash?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Metadados criptografados do participante 1 (nome, foto, id)' })
    encryptedMetadataUser1?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Metadados criptografados do participante 2 (nome, foto, id)' })
    encryptedMetadataUser2?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Hash da última mensagem da conversa (elo da hash chain)' })
    lastMessageHash?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Última mensagem cifrada' })
    lastMessageEncrypted?: string;

    @Column({ type: 'timestamp without time zone', nullable: true })
    @ApiProperty({ description: 'Data da última mensagem' })
    lastMessageAt?: Date;

    @Column({ default: 0 })
    @ApiProperty({ description: 'Mensagens não lidas para o usuário 1' })
    unreadCountUser1?: number;

    @Column({ default: 0 })
    @ApiProperty({ description: 'Mensagens não lidas para o usuário 2' })
    unreadCountUser2?: number;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Título opcional da conversa' })
    title?: string;

    // Campos legados mantidos como opcionais/nullable para compatibilidade
    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do primeiro participante (legado)' })
    user1Id?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Nome do primeiro participante (legado)' })
    user1Name?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Foto do primeiro participante (legado)' })
    user1Photo?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do segundo participante (legado)' })
    user2Id?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Nome do segundo participante (legado)' })
    user2Name?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Foto do segundo participante (legado)' })
    user2Photo?: string;
}
