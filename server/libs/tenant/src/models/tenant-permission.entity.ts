import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

/**
 * Entidade TenantPermission: Controla permissões granulares de acesso a um Tenant
 * (visualizar, ver, editar e/ou compartilhar).
 */
@Entity()
export class TenantPermission {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ description: 'ID do Tenant ao qual a permissão se aplica' })
    @Index()
    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ApiProperty({ type: () => Tenant, required: false, nullable: true })
    @ManyToOne(() => Tenant, tenant => tenant.permissions, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant?: Tenant;

    @ApiProperty({ required: false, nullable: true, description: 'ID do usuário beneficiário da permissão' })
    @Index()
    @Column({ name: 'user_id', nullable: true })
    userId?: string;

    @ApiProperty({ required: false, nullable: true, description: 'ID da organização associada à permissão' })
    @Index()
    @Column({ name: 'organizacao_id', nullable: true })
    organizacaoId?: string;

    @ApiProperty({ required: false, nullable: true, description: 'Role opcional associada à permissão' })
    @Column({ nullable: true })
    role?: string;

    @ApiProperty({ default: true, description: 'Permite visualizar o tenant nas listagens e filtros' })
    @Column({ name: 'can_visualizar', default: true })
    canVisualizar: boolean;

    @ApiProperty({ default: true, description: 'Permite ver detalhes e registros vinculados ao tenant' })
    @Column({ name: 'can_ver', default: true })
    canVer: boolean;

    @ApiProperty({ default: false, description: 'Permite editar e criar dados no tenant' })
    @Column({ name: 'can_editar', default: false })
    canEditar: boolean;

    @ApiProperty({ default: false, description: 'Permite compartilhar o tenant e gerenciar permissões' })
    @Column({ name: 'can_compartilhar', default: false })
    canCompartilhar: boolean;

    @ApiProperty({ required: false, nullable: true, description: 'ID do usuário que concedeu a permissão' })
    @Column({ name: 'granted_by', nullable: true })
    grantedBy?: string;

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    createdAt?: Date;

    @ApiProperty({ nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}
