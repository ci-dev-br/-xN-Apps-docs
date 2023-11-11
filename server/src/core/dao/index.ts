import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/models/user.entity";
import { Tenant } from "src/tenant/models/tenant.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from "typeorm";

export abstract class AuditedEntity {
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @PrimaryGeneratedColumn('uuid')
    internalId: string;
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => User)
    tenants: Tenant[];
    @ApiProperty({ nullable: true, required: false })
    @CreateDateColumn({})
    createdAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => User)
    createdBy?: User;
    @ApiProperty({ nullable: true, required: false })
    @UpdateDateColumn()
    updatedAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => User)
    lastModifiedBy?: User;
}

@Entity()
export class Snapshot extends AuditedEntity {
    @Column({ type: 'jsonb' })
    snap: any;
}

export abstract class FullAuditedEntity extends AuditedEntity {
    @ManyToOne(() => User)
    snapshots?: Snapshot[];
}

/***
 * Serviço de Snapshot
 * 
 */
@Injectable()
export class SnapshotService {
    constructor(
        private readonly snapRepo: Repository<Snapshot>,
    ) { }
    async snapshot(entidade: FullAuditedEntity) {
        const snap = this.snapRepo.create({
            snap: JSON.parse(JSON.stringify(entidade, null, 2)),
        })
        this.snapRepo.save(snap);
    }
} 