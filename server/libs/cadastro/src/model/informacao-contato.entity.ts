import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
/**
 * Informação de Contato
 */
@Entity({ schema })
export class InformacaoContato extends FullAuditedEntity {
    @ApiProperty({ title: 'Descrição', nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
    @ApiProperty({ title: 'Nome', nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ title: 'Telefone', format: 'phone', nullable: true, required: false })
    @Column({ nullable: true })
    phoneNumber?: string;
    @ApiProperty({ title: 'Número de WhatsApp', nullable: true, required: false })
    @Column({ nullable: true })
    whatsAppNumber?: string;
    @ApiProperty({ title: 'ID do Facebook', nullable: true, required: false })
    @Column({ nullable: true })
    facebook?: string;
    @ApiProperty({ title: 'ID do Instagram', nullable: true, required: false })
    @Column({ nullable: true })
    linkedin?: string;
    @ApiProperty({ title: 'ID do Tiktok', nullable: true, required: false })
    @Column({ nullable: true })
    tiktok?: string;
    @ApiProperty({ title: 'ID do Instagram', nullable: true, required: false })
    @Column({ nullable: true })
    instagram?: string;

}