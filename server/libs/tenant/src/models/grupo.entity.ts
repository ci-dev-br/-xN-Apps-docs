import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Tenant } from "./tenant.entity";

/**
 * Entidade Grupo: Representa um grupo ou comunidade social.
 * Cada Grupo possui um Tenant dedicado para compartilhamento de dados entre os membros.
 */
@Entity()
export class Grupo {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ description: 'Nome / Título do Grupo' })
    @Column()
    name: string;

    @ApiProperty({ nullable: true, description: 'Descrição dos objetivos do grupo' })
    @Column({ nullable: true, type: 'text' })
    descriptions?: string;

    @ApiProperty({ nullable: true, description: 'URL da foto de capa' })
    @Column({ nullable: true, type: 'text' })
    coverUrl?: string;

    @ApiProperty({ nullable: true, description: 'URL do avatar ou logotipo do grupo' })
    @Column({ nullable: true, type: 'text' })
    avatarUrl?: string;

    @ApiProperty({ default: true, description: 'Se novos participantes requerem aprovação do administrador' })
    @Column({ default: true })
    requiresApproval: boolean;

    @ApiProperty({ description: 'ID do usuário criador' })
    @Column({ nullable: true })
    createdBy?: string;

    @ApiProperty({ description: 'ID do usuário administrador' })
    @Column({ nullable: true })
    adminId?: string;

    @ApiProperty({ type: () => Tenant, description: 'Tenant associado para compartilhamento de dados entre os membros' })
    @ManyToOne(() => Tenant, { nullable: false, eager: true, cascade: true })
    @JoinColumn({ name: 'tenant_id' })
    tenant?: Tenant;

    @ApiProperty({ description: 'ID do Tenant associado' })
    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    createdAt?: Date;

    @ApiProperty({ nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}
