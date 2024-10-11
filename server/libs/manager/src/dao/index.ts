import { Injectable } from "@nestjs/common";
import { ApiExcludeController, ApiExcludeEndpoint, ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Column, CreateDateColumn, Entity, Equal, FindOneOptions, FindOptionsRelationByString, FindOptionsRelations, FindOptionsWhere, IsNull, JoinColumn, JoinTable, ManyToMany, ManyToOne, Not, OneToOne, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from "typeorm";
import { Tenant } from "@ci/tenant";

import { createHash } from 'crypto';
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

    async obterLista(options?: { skip?: number, take?: number, where?: FindOptionsWhere<E>[] | FindOptionsWhere<E>, relations?: FindOptionsRelations<E> | FindOptionsRelationByString, orderBy?: any }, request?: any) {
        let _where: FindOptionsWhere<E>[] | FindOptionsWhere<E> = options.where || {};

        if (_where)
            (Array.isArray(_where) ? _where : [_where]).forEach((w: any) => {
                w.createdBy = { identifiedUser: Equal(request.user.id) };
                w.deleted = IsNull();

                if (!Array.isArray(_where)) _where = [_where];
                if (Array.isArray(_where)) _where.push({ ...w, deleted: IsNull() })
            });
        return ((await this._repo.find({ skip: options.skip, take: options.take, where: _where, relations: { createdBy: true, lastModifiedBy: true } as any, order: options.orderBy })) || [])
    }
    async getByInternalId(internalId: string, request?: any) {
        let where: FindOptionsWhere<E> = {
            internalId: Equal(internalId),
            deleted: IsNull(),
            createdBy: { identifiedUser: Equal(request.user.id) }
        } as FindOptionsWhere<E>;

        return await this._repo.findOne({ where, relations: { createdBy: true, lastModifiedBy: true } as any })
    }
    /**
     * Marca registro com deletado. Posteriormente é removido da base principal em processo separado.
     */
    async delete(data: E, request?: any) {
        const old_data = (await this.getByInternalId(data.internalId, request));
        old_data.deleted = true;
        await this._repo.save(old_data);
    }
}
export class SyncPayloadDao<Entity> {
    @ApiProperty()
    data?: Entity;
}

export class GetByInternalIdInputDto {
    @ApiProperty({ nullable: true, required: false })
    internalId?: string;
}

export abstract class ControllerDaoBase<Service extends DaoServiceBase<E>, E> {
    constructor(
        private _service: Service,
    ) { }

    async Sync(entity: SyncPayloadDao<E>, request?: any) {
        return await this._service.sincronizar(entity.data, request);
    }
    async GetList(options?: { skip?: number, take?: number, where?: any, relations?: FindOptionsRelations<E> | FindOptionsRelationByString, orderBy?: any }, request?: any) {
        return await this._service.obterLista(options, request);
    }

    async GetByInternalId(payload: GetByInternalIdInputDto, request?: any) {
        return await this._service.getByInternalId(payload.internalId, request);
    }

    async Delete(item: E, request?: any) {
        return await this._service.delete(item, request);
    }

} 