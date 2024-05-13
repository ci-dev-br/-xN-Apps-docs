import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Column, CreateDateColumn, Entity, Equal, FindOneOptions, FindOptionsWhere, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from "typeorm";
import { Tenant } from "src/tenant/models/tenant.entity";

import { createHash } from 'crypto';
// import { AccessCredential } from "src/auth/models/user-credential.entity";
import { ChaveAcesso } from "src/core/audt/chave-acesso.entity";

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
    @JoinTable()
    createdBy?: ChaveAcesso;
    @ApiProperty({ nullable: true, required: false })
    @UpdateDateColumn()
    lastModifiedAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @ManyToOne(() => ChaveAcesso, { nullable: true })
    @JoinTable()
    lastModifiedBy?: ChaveAcesso;
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

    async sincronizar(data: E, request?: any) {
        let ___receipt_data = data;
        let ___internal_data: E = null;
        /// if (data instanceof AuditedEntity) {
        if (!data.internalId) {
            ___internal_data =
                this._repo.create(data);
            if (request) {
                if (request.chaveAcesso) {
                    ___internal_data.createdBy = { id: request.chaveAcesso };
                }
            }
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

                    if (request) {
                        if (request.chaveAcesso) {
                            ___internal_data.lastModifiedBy = { id: request.chaveAcesso };
                        }
                    }
                    // TODO: adicionar usuário modificador

                    if (___internal_data instanceof FullAuditedEntity) {
                        await this._snap.snapshot(___internal_data);
                    }
                }
            }
        }
        return await this._repo.save(___internal_data);
        /// }
    }

    async obterLista(options?: { skip?: number, take?: number, where?: FindOptionsWhere<E>[] | FindOptionsWhere<E> }, request?: any) {

        let _where: FindOptionsWhere<E>[] | FindOptionsWhere<E> = options.where;

        // if (Array.isArray(_where)) {
        //     _where.forEach(w => {
        //         w.createdBy = { identifiedUser: Equal('') };
        //     })
        // }

        return await this._repo.find({ skip: options.skip, take: options.take, where: _where });
    }
}

export class SyncPayloadDao<Entity> {
    @ApiProperty()
    data?: Entity;
}

export abstract class ControllerDaoBase<Service extends DaoServiceBase<E>, E> {
    constructor(
        private _service: Service,
    ) { }

    async sync(entity: SyncPayloadDao<E>, request?: any) {
        return await this._service.sincronizar(entity.data, request);
    }
    async get(options?: { skip?: number, take?: number, where?: any }, request?: any) {
        return await this._service.obterLista(options);
    }
} 