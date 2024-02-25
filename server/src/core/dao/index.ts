import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from "typeorm";
import { Tenant } from "src/tenant/models/tenant.entity";

import { createHash } from 'crypto';
import { AccessCredential } from "src/auth/models/user-credential.entity";

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
    @OneToOne(() => AccessCredential)
    @JoinColumn()
    createdBy?: AccessCredential;
    @ApiProperty({ nullable: true, required: false })
    @UpdateDateColumn()
    lastModifiedAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @OneToOne(() => AccessCredential)
    @JoinColumn()
    lastModifiedBy?: AccessCredential;
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
        private readonly _snap: SnapshotService,
        private readonly _repo?: Repository<E>,
    ) {
    }

    async sincronizar(data: E) {
        let ___receipt_data = data;
        let ___internal_data: E = null;
        if (data instanceof AuditedEntity) {
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
                        // TODO: adicionar usuário modificador

                        if (___internal_data instanceof FullAuditedEntity) {
                            await this._snap.snapshot(___internal_data);
                        }
                    }
                }
            }
            return await this._repo.save(___internal_data);
        }
    }
}

export class SyncPayloadDao<Entity>{
    @ApiProperty()
    data?: Entity;
}

export abstract class ControllerDaoBase<Service extends DaoServiceBase<any>, E> {
    constructor(
        private _service: Service,
    ) { }

    async sync(entity: SyncPayloadDao<E>) {
        return await this._service.sincronizar(entity.data);
    }
    async get(query: string) {
        // return await this._service.sincronizar(entity.data);
    }
} 