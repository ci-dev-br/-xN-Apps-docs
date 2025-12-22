import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

/**
 * Entidade de Convite para registro de novos usuários na plataforma.
 */
@Entity()
export class Invite extends FullAuditedEntity {
    /**
     * Email do convidado.
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    email?: string;
    /**
     * Nome amigável do convidado.
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    friendlyName?: string;
    /**
     * Mensagem personalizada do convite.
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    mensagem?: string;
    /**
     * Define se o convite já enviou o convite por e-mail.
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    invited?: boolean;
    /**
     * Define se o convite foi aceito pelo convidado.
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    accepted?: boolean;
    /**
     * Telefone para envio de SMS.
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    phoneSMS?: string;
    /**
     * Telefone para envio de WhatsApp.
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    phoneWhatsApp?: string;
}