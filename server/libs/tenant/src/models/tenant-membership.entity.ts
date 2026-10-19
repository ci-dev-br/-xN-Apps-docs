import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export type MembershipRole = 'ADMIN' | 'MEMBER';
export type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Entidade TenantMembership: Vínculo e solicitação de participação em Grupos / Tenants.
 */
@Entity()
export class TenantMembership {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ description: 'ID do grupo / tenant' })
    @Column()
    tenantId: string;

    @ApiProperty({ description: 'ID do usuário solicitante ou membro' })
    @Column()
    userId: string;

    @ApiProperty({ enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' })
    @Column({ default: 'MEMBER' })
    role: MembershipRole;

    @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
    @Column({ default: 'PENDING' })
    status: MembershipStatus;

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    requestedAt?: Date;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true, type: 'timestamp' })
    approvedAt?: Date;
}
