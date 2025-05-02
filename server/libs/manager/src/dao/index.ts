import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Tenant } from "@ci/tenant";
import { ChaveAcesso } from "@ci/core";
import { Exclude } from "class-transformer";
export abstract class AuditedEntity {
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @PrimaryGeneratedColumn('uuid')
    internalId?: string;
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => Tenant)
    @JoinTable()
    tenants?: Tenant[];
    @ApiProperty({ nullable: true, required: false })
    @CreateDateColumn({})
    createdAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @ManyToOne(() => ChaveAcesso, { nullable: true })
    @JoinColumn()
    createdBy?: ChaveAcesso;
    @ApiProperty({ nullable: true, required: false })
    @UpdateDateColumn()
    lastModifiedAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @ManyToOne(() => ChaveAcesso, { nullable: true })
    @JoinColumn()
    lastModifiedBy?: ChaveAcesso;
    @Exclude()
    @Column({ nullable: true })
    deleted?: boolean;
}
/**
 * Snapshot representa os dados visualizados por um ou mais usuários em um determinado momento. Toda vez que um dado é consultado, ele cria um snapshot, que permanece por um curto período em cache no Nodo da aplicação, para acesso de todos que possuem os níveis de acesso necessários.  
 * 
 */
@Entity({ schema: 'snapshot' })
export class Snapshot extends AuditedEntity {
    @Column({ type: 'jsonb' })
    snap: any;
    @Column({
        nullable: true,
    })
    hash: string;
}
/***
 * Entidade Auditável vinculada entre usuário 1:n Tenant . 
 * 
 */
export abstract class FullAuditedEntity extends AuditedEntity {
    @ManyToMany(() => Snapshot)
    @JoinTable({ schema: 'snapshot' })
    snapshots?: Snapshot[];
}

export * from './snapshot.service'
export * from './sync-payload.dao'
export * from './controller-dao-base'
export * from './dao-full-audited-service-base'
export * from './get-by-internal-id-input.dto'