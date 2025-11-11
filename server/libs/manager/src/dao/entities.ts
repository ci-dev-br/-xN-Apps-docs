import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Tenant } from "@ci/tenant";
import { Credential } from "@ci/core";
import { Exclude } from "class-transformer";
/**
 * Basic Entity catalog
 */
export abstract class BasicIdentifiedEntity {
    @ApiProperty({
        nullable: true,
        required: false,
        uniqueItems: true,
        readOnly: true,
    })
    @PrimaryGeneratedColumn('uuid')
    internalId?: string;
}
/**
 * Audited Entity
 */
export abstract class AuditedEntity extends BasicIdentifiedEntity {
    @ApiProperty({
        nullable: true,
        required: false,
        uniqueItems: true,
        readOnly: true
    })
    @PrimaryGeneratedColumn('uuid')
    internalId?: string;
    @ApiProperty({
        nullable: true, required: false, properties: {
            a: {
                title: 'required',
            }
        }
    })
    @ManyToMany(() => Tenant)
    @JoinTable()
    tenants?: Tenant[];
    @ApiProperty({
        title: 'Data de criação',
        nullable: true,
        required: false,
        type: 'Date',
        readOnly: true,
    })
    @CreateDateColumn()
    createdAt?: Date;
    @ApiProperty({
        title: 'Criado Por',
        nullable: true,
        required: false,
        readOnly: true
    })
    @ManyToOne(() => Credential, { nullable: true })
    @JoinColumn()
    createdBy?: Credential;
    @ApiProperty({
        title: 'Ultima modificação em',
        nullable: true,
        required: false, type: 'Date',
        readOnly: true,
    })
    @UpdateDateColumn()
    lastModifiedAt?: Date;
    @ApiProperty({ title: 'Ultima modificação por', nullable: true, required: false, readOnly: true })
    @ManyToOne(() => Credential, { nullable: true })
    @JoinColumn()
    lastModifiedBy?: Credential;
    @ApiProperty({
        title: 'Deletado',
        type: 'boolean',
        required: false,
        nullable: true,
        default: undefined,
        readOnly: true,
    })
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