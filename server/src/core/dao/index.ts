import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Column, CreateDateColumn, Entity, Equal, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from "typeorm";
import { User } from "src/auth/models/user.entity";
import { Tenant } from "src/tenant/models/tenant.entity";

import { createHash } from 'crypto';
import sha256 from 'sha256';
import { json } from "stream/consumers";
import { UserService } from "src/auth/auth.module";

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
    lastModifiedAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => User)
    lastModifiedBy?: User;
}

@Entity({ schema: 'snapshot' })
export class Snapshot extends AuditedEntity {
    @Column({ type: 'jsonb' })
    snap: any;
    @Column({
        nullable: true,
    })
    hash: string;
}

export abstract class FullAuditedEntity extends AuditedEntity {
    @ManyToMany(() => Snapshot)
    @JoinTable({ schema: 'snapshot' })
    snapshots?: Snapshot[];
}

/***
 * Serviço de Snapshot
 * 
 */
@Injectable()
export class SnapshotService {
    lastSnapshotHash: string;
    constructor(
        @InjectRepository(Snapshot)
        private readonly snapRepo: Repository<Snapshot>,
    ) {
        this.carregarUltimoHash();
    }
    async carregarUltimoHash() {
        try {
            const hash = await this.snapRepo.findOne({ order: { createdAt: 'ASC' } });
            if (!!hash && !!hash.hash)
                this.lastSnapshotHash = hash.hash;
        } catch (error) {

        }
    }
    async snapshot(entidade: FullAuditedEntity) {
        const json_snapshot = JSON.parse(JSON.stringify(entidade, null, 2));
        const moment = new Date().toISOString();
        const hash = createHash('sha256').update([this.lastSnapshotHash || ''] + json_snapshot + moment).digest('hex').toString();
        const snap = this.snapRepo.create({
            snap: json_snapshot,
            hash: hash,
        })
        this.lastSnapshotHash = hash;
        this.snapRepo.save(snap);
    }
    async prepareToSync(entidade: any) {
        if (entidade instanceof FullAuditedEntity) {
            await this.snapshot(entidade);
        }
    }
}


export abstract class DaoServiceBase<E extends FullAuditedEntity> {
    constructor(
        // private readonly _userService: UserService,
        @InjectRepository(Entity)
        private readonly _repo?: Repository<E>,
    ) {
    }

    async sincronizar(data: E) {
        let ___receipt_data = data;
        let ___internal_data: E = null;
        if (data instanceof FullAuditedEntity) {
            if (!data.internalId) {
                ___internal_data =
                    this._repo.create(data);
            } else {
                if (data && !!data.internalId) {
                    ___internal_data = await this._repo.findOne({
                        where: {
                            internalId: ___receipt_data.internalId
                        } as any
                    });
                    if (___internal_data) {
                        // TODO: verificar policy
                        // const { internalId, } = ___receipt_data
                        Object.keys(___internal_data)
                            .filter(p => !['internalId', 'createdAt', 'createdBy'].includes(p))
                            .forEach(p => ___internal_data[p] = ___receipt_data[p]);

                        ___internal_data.lastModifiedAt = new Date();
                    }
                }
            }
            this._repo.save(___internal_data);
        }

    }
}  