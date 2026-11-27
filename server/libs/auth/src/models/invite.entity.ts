import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, Column, Entity } from "typeorm";
import { createHash } from "crypto";

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
     * Hash único do convite enviado por e-mail para registro do convidado.
     */
    @ApiProperty({ nullable: true, required: false, title: 'Invite Hash' })
    @Column({ nullable: true })
    inviteHash?: string;
    /**
     * Papéis (Roles) atribuídos por padrão ao convidado no momento do cadastro (padrão: ['USER']).
     */
    @ApiProperty({ nullable: true, required: false, title: 'Papéis padrão do convidado' })
    @Column({ nullable: true, type: 'varchar', array: true, default: ['USER'] })
    roles?: string[];
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
    /**
     * IDs dos Tenants de destino associados ao convite.
     */
    @ApiProperty({ nullable: true, required: false, isArray: true, type: String, title: 'Tenants de destino' })
    @Column({ nullable: true, type: 'varchar', array: true })
    tenantIds?: string[];

    @BeforeInsert()
    ensureInviteDefaults() {
        if (!this.inviteHash) {
            const timestamp = this.createdAt ? this.createdAt.toISOString() : new Date().toISOString();
            const normalizedEmail = (this.email || '').trim().toLowerCase();
            this.inviteHash = 'INVITE-' + createHash('sha256')
                .update(`${timestamp}:${normalizedEmail}:${Math.random()}`)
                .digest('hex');
        }
        if (!this.roles || this.roles.length === 0) {
            this.roles = ['USER'];
        }
    }
}