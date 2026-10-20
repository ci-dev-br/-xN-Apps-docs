import { Column, Entity, Index } from "typeorm";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema })
export class Conversation extends FullAuditedEntity {
    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do primeiro participante' })
    user1Id?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Nome do primeiro participante' })
    user1Name?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Foto do primeiro participante' })
    user1Photo?: string;

    @Column({ nullable: true })
    @Index()
    @ApiProperty({ description: 'ID do segundo participante' })
    user2Id?: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Nome do segundo participante' })
    user2Name?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Foto do segundo participante' })
    user2Photo?: string;

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
}