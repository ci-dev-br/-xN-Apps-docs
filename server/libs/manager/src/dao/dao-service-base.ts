import { DataSource, Equal, FindOptionsRelationByString, FindOptionsRelations, FindOptionsWhere, IsNull, Repository } from "typeorm";
import { FullAuditedEntity, SnapshotService } from "./entities";
// import { UserService } from "@ci/user/service/user.service";
// import { forwardRef, Inject } from "@nestjs/common";

export abstract class DaoServiceBase<E> {
    constructor(
        protected readonly _snap: SnapshotService,
        protected readonly _repo?: Repository<E>,
        private readonly _dataSource?: DataSource,
        // @Inject(forwardRef(() => UserService))
        // private readonly _userService?: UserService,
    ) {
    }
    async sincronizar(data: E, request?: any) {
        let ___receipt_data = data;
        let ___internal_data: E = null;
        /// if (data instanceof AuditedEntity) {
        let old_value = null;

        try {
            old_value = await this._repo.findOne(this._repo.getId(data));
        } catch (error) {
            console.error(error);
        }

        if (!old_value) {
            ___internal_data =
                this._repo.create(data);
            if (request) {
                if (request.chaveAcesso) {
                    (___internal_data as any).createdBy = { id: request.chaveAcesso };
                }
            }
        } else {
            if (data && !!data) {
                /*  ___internal_data = await this._repo.findOne({
                     where: {
                         internalId: ___receipt_data.internalId
                     } as any
                 }); */
                if (___internal_data) {
                    // TODO: verificar policy
                    // const { internalId, } = ___receipt_data
                    Object.keys(___internal_data)
                        .filter(p => !['internalId', 'createdAt', 'createdBy'].includes(p))
                        .forEach(p => ___internal_data[p] = ___receipt_data[p]);
                    // ___internal_data.lastModifiedAt = new Date();
                    if (request) {
                        if (request.chaveAcesso) {
                            //  ___internal_data.lastModifiedBy = { id: request.chaveAcesso };
                        }
                    }
                    // TODO: adicionar usuário modificador
                    if (___internal_data instanceof FullAuditedEntity) {
                        await this._snap.snapshot(___internal_data, request);
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
                w.createdBy = {
                    identifiedUser: Equal(request?.user?.id)
                };
                w.deleted = IsNull();
                if (!Array.isArray(_where)) _where = [_where];
                if (Array.isArray(_where)) _where.push({ ...w, deleted: IsNull() })
            });
        const result = ((await this._repo.find({
            skip: options.skip,
            take: options.take,
            where: _where,
            relations: { createdBy: true, lastModifiedBy: true } as any, order: options.orderBy
        })) || []);

        for (let r of result as any[]) {
            if (r.createdBy) {
                r.createdBy = {
                    id: r.createdBy.id,
                    // identifiedUser: r.createdBy.identifiedUser,
                };
                // if (!!this._dataSource && !!r?.createdBy?.identifiedUser) {
                //     r.createdBy.user =
                //         await (this._dataSource.qwuer});
                // }
            }
        }

        return result;
    }
    // abstract getId(data: E): Promise<string | string[]>;
    abstract getById(id: string | string[], request?: any): Promise<E>;
    // async getByInternalId(internalId: string, request?: any) {
    //     let where: FindOptionsWhere<E> = {
    //         internalId: Equal(internalId),
    //         deleted: IsNull(),
    //         createdBy: { identifiedUser: Equal(request.user.id) }
    //     } as FindOptionsWhere<E>;
    //     return await this._repo.findOne({ where, relations: { createdBy: true, lastModifiedBy: true } as any })
    // }
    /**
     * Marca registro com deletado. Posteriormente é removido da base principal em processo separado.
     */
    async delete(data: E, request?: any) {
        const old_data = (await this.getById(this._repo.getId(data), request));
        // Create snapshot of deleted data
        this._snap.snapshot({
            deleted: true,
            data: old_data,
        }, request, this._repo)
        await this._repo.delete(this._repo.getId(data));
    }
}