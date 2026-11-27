import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TenantPermission } from "./tenant-permission.entity";

/**
 * Entidade Tenant: Representa a fronteira de inquilino/compartilhamento de dados.
 */
@Entity()
export class Tenant {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ nullable: true, description: 'Identificador / Nome do Tenant' })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({ nullable: true, description: 'Descrição' })
    @Column({ nullable: true, type: 'text' })
    descriptions?: string;

    @ApiProperty({ nullable: true, required: false, description: 'ID da organização proprietária/vinculada' })
    @Column({ name: 'organizacao_id', nullable: true })
    organizacaoId?: string;

    @ApiProperty({ nullable: true, description: 'Criador do Tenant' })
    @Column({ nullable: true })
    createdBy?: string;

    @ApiProperty({ type: () => [TenantPermission], required: false, nullable: true })
    @OneToMany(() => TenantPermission, perm => perm.tenant)
    permissions?: TenantPermission[];

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    createdAt?: Date;

    @ApiProperty({ nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}