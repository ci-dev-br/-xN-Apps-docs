import { Equal, FindOperator, FindOptionsRelationByString, FindOptionsRelations, FindOptionsWhere, ILike, In, IsNull, Repository } from "typeorm";
import { FullAuditedEntity, SnapshotService } from "./entities";
import { User } from "@ci/auth/models/user.entity";

export abstract class DaoFullAuditedServiceBase<E extends FullAuditedEntity> {
    constructor(
        protected readonly _snap: SnapshotService,
        protected readonly _repo?: Repository<E>,
    ) {
    }
    private normalizeTenantsPayload(rawTenants: any): Array<{ id: string }> | undefined {
        if (!Array.isArray(rawTenants)) return undefined;
        const normalized = rawTenants
            .map((t: any) => (typeof t === 'string' ? t.trim() : t?.id))
            .filter((id: any) => typeof id === 'string' && id.trim().length > 0)
            .map((id: string) => ({ id: id.trim() }));
        return normalized;
    }

    async sincronizar(data: E, request?: any) {
        let ___receipt_data = data;
        let ___internal_data: E = null;
        if (___receipt_data && Array.isArray((___receipt_data as any).tenants)) {
            (___receipt_data as any).tenants = this.normalizeTenantsPayload((___receipt_data as any).tenants);
        } else if (___receipt_data && !___receipt_data.internalId && request?.headers?.['x-tenant-id']) {
            const headerTenant = String(request.headers['x-tenant-id']).trim();
            if (headerTenant) {
                (___receipt_data as any).tenants = [{ id: headerTenant }];
            }
        }
        /*  if ('at' in data && 'what' in data) {
 
             return await { status: 'fail' };
         } */
        /// if (data instanceof AuditedEntity) {
        if (data && !('internalId' in data) && !data.internalId) {
            ___internal_data = this._repo.create(data);
            if (!!request) {
                if (!!request.chaveAcesso) {
                    ___internal_data.createdBy = { id: request.chaveAcesso };
                }
            }
        } else {
            if (!!data && ('internalId' in data) && !!data.internalId) {
                ___internal_data = await this._repo.findOne({
                    where: {
                        internalId: ___receipt_data.internalId
                    } as any
                });
                if (___internal_data) {
                    // TODO: verificar policy
                    [...new Set([...Object.keys(___receipt_data), ...Object.keys(___internal_data)])]
                        .filter(p => !['internalId', 'createdAt', 'createdBy', 'id'].includes(p))
                        .forEach(p => {
                            if (___receipt_data[p] !== undefined && // receipt undefined apenas deve ignorar atualização da propriedade, para limpar o campo necessário null
                                ___internal_data[p] !== ___receipt_data[p]
                            ) {
                                ___internal_data[p] = ___receipt_data[p];
                            }
                        });
                    ___internal_data.lastModifiedAt = new Date();
                    if (request) {
                        if (request.chaveAcesso) {
                            ___internal_data.lastModifiedBy = { id: request.chaveAcesso };
                        }
                    }
                    // TODO: adicionar usuário modificador
                    if (___internal_data instanceof FullAuditedEntity) {
                        await this._snap.snapshot(___internal_data, request, this._repo);
                    }
                }
            }
        }
        // console.log(___internal_data);
        return await this._repo.save(___internal_data);
        /// }
    }

    /**
     * Converte um objeto de filtro baseado nas propriedades do schema da entidade
     * em condições TypeORM (`ILike` para campos texto, `Equal` para demais tipos).
     */
    protected buildSchemaWhereFilter(rawFilter?: any): Record<string, any> {
        if (!rawFilter || typeof rawFilter !== 'object' || Array.isArray(rawFilter)) {
            return {};
        }
        const columnsMeta = this._repo?.metadata?.columns || [];
        const columnMap = new Map<string, any>();
        columnsMeta.forEach(col => columnMap.set(col.propertyName, col));

        const built: Record<string, any> = {};
        for (const [key, rawVal] of Object.entries(rawFilter)) {
            if (rawVal === undefined || rawVal === null || rawVal === '') continue;
            if (['createdBy', 'lastModifiedBy', 'deleted', 'snapshots', 'tenants'].includes(key)) continue;

            if (rawVal instanceof FindOperator) {
                built[key] = rawVal;
                continue;
            }

            const col = columnMap.get(key);
            if (!col && columnMap.size > 0) {
                continue;
            }

            if (typeof rawVal === 'string') {
                const trimmed = rawVal.trim();
                if (!trimmed) continue;
                const colType = String(col?.type || '').toLowerCase();
                const isEnumOrUuid = Boolean(col?.enum) || colType === 'uuid' || key === 'internalId';
                built[key] = isEnumOrUuid ? Equal(trimmed) : ILike(`%${trimmed}%`);
            } else if (typeof rawVal === 'number' || typeof rawVal === 'boolean') {
                built[key] = Equal(rawVal);
            } else if (typeof rawVal === 'object' && 'value' in (rawVal as any)) {
                const innerVal = (rawVal as any).value;
                if (innerVal !== undefined && innerVal !== null && innerVal !== '') {
                    built[key] = typeof innerVal === 'string' ? ILike(`%${innerVal.trim()}%`) : Equal(innerVal);
                }
            }
        }
        return built;
    }

    /**
     * Constrói condições de busca textual livre (`search`) em todas as colunas textuais do schema da entidade.
     */
    protected buildGlobalSearchConditions(searchText?: string): Record<string, any>[] {
        if (!searchText || typeof searchText !== 'string' || !searchText.trim()) {
            return [];
        }
        const term = searchText.trim();
        const columnsMeta = this._repo?.metadata?.columns || [];
        const textColumns = columnsMeta.filter(col => {
            if (['internalId', 'deleted'].includes(col.propertyName)) return false;
            if (col.isArray) return false;
            const t = String(col.type || '').toLowerCase();
            return t === 'varchar' || t === 'text' || t === 'character varying' || t === 'char' || col.type === String;
        });

        return textColumns.map(col => ({
            [col.propertyName]: ILike(`%${term}%`)
        }));
    }

    private extractRequestedTenantIds(options?: any, request?: any): string[] {
        const rawSources = [
            options?.tenantIds,
            options?.tenants,
            options?.filter?.tenantIds,
            options?.filter?.tenants,
            options?.filter?.tenantId,
            !Array.isArray(options?.where) ? options?.where?.tenants : undefined,
            !Array.isArray(options?.where) ? options?.where?.tenantId : undefined,
            request?.headers?.['x-tenant-id'],
        ];
        const ids = new Set<string>();
        for (const src of rawSources) {
            if (!src) continue;
            if (Array.isArray(src)) {
                src.forEach(item => {
                    const id = typeof item === 'string' ? item.trim() : item?.id;
                    if (id) ids.add(String(id));
                });
            } else if (typeof src === 'string') {
                src.split(',').map(s => s.trim()).filter(Boolean).forEach(id => ids.add(id));
            } else if (typeof src === 'object' && src.id) {
                ids.add(String(src.id));
            }
        }
        return Array.from(ids);
    }

    async obterLista(options?: {
        skip?: number,
        take?: number,
        where?: FindOptionsWhere<E>[] | FindOptionsWhere<E>,
        filter?: Partial<E> | Record<string, any>,
        search?: string,
        tenantIds?: string[],
        tenants?: any,
        relations?: FindOptionsRelations<E> | FindOptionsRelationByString,
        orderBy?: any
    }, request?: { user: User; headers?: Record<string, any> }) {
        const opts = options || {};
        const rawWhere = opts.where;
        const rawFilter = opts.filter;

        const baseSchemaFilters: Record<string, any>[] = [];
        if (Array.isArray(rawWhere) && rawWhere.length > 0) {
            rawWhere.forEach(w => {
                const parsed = this.buildSchemaWhereFilter(w);
                if (Object.keys(parsed).length > 0) baseSchemaFilters.push(parsed);
            });
        } else {
            const mergedFilter = {
                ...(rawWhere && typeof rawWhere === 'object' ? rawWhere : {}),
                ...(rawFilter && typeof rawFilter === 'object' ? rawFilter : {}),
            };
            const parsed = this.buildSchemaWhereFilter(mergedFilter);
            if (Object.keys(parsed).length > 0) {
                baseSchemaFilters.push(parsed);
            }
        }

        const searchConditions = this.buildGlobalSearchConditions(opts.search);
        const combinedFieldFilters: Record<string, any>[] = [];

        if (baseSchemaFilters.length > 0 && searchConditions.length > 0) {
            for (const bf of baseSchemaFilters) {
                for (const sc of searchConditions) {
                    combinedFieldFilters.push({ ...bf, ...sc });
                }
            }
        } else if (baseSchemaFilters.length > 0) {
            combinedFieldFilters.push(...baseSchemaFilters);
        } else if (searchConditions.length > 0) {
            combinedFieldFilters.push(...searchConditions);
        } else {
            combinedFieldFilters.push({});
        }

        const requestedTenantIds = this.extractRequestedTenantIds(opts, request);
        const isElevated = Boolean(
            request?.user?.roles?.includes('ADMIN') ||
            request?.user?.roles?.includes('MASTER') ||
            request?.user?.roles?.includes('DEVELOPER'),
        );
        const userTenantIds = new Set(
            ((request?.user as any)?.tenants || []).map((t: any) => t?.id).filter(Boolean) as string[],
        );
        const effectiveTenantIds = requestedTenantIds.length > 0
            ? (isElevated || userTenantIds.size === 0
                ? requestedTenantIds
                : requestedTenantIds.filter(id => userTenantIds.has(id)))
            : [];

        const hasTenantsRelation = this.hasTenantsRelation();

        const userId = request?.user?.id;
        const finalWhere: FindOptionsWhere<E>[] = [];

        for (const fieldFilter of combinedFieldFilters) {
            if (requestedTenantIds.length > 0 && hasTenantsRelation) {
                if (effectiveTenantIds.length === 0) {
                    continue;
                }
                finalWhere.push({
                    ...fieldFilter,
                    deleted: IsNull(),
                    tenants: { id: In(effectiveTenantIds) },
                } as any);
                continue;
            }

            if (userId) {
                finalWhere.push({
                    ...fieldFilter,
                    deleted: IsNull(),
                    createdBy: { identifiedUser: Equal(userId) },
                } as any);
            }
            if (hasTenantsRelation && userTenantIds.size > 0) {
                finalWhere.push({
                    ...fieldFilter,
                    deleted: IsNull(),
                    tenants: { id: In(Array.from(userTenantIds)) },
                } as any);
            }
            finalWhere.push({
                ...fieldFilter,
                deleted: IsNull(),
                createdBy: IsNull(),
            } as any);
            if (isElevated) {
                finalWhere.push({
                    ...fieldFilter,
                    deleted: IsNull(),
                } as any);
            }
        }

        if (requestedTenantIds.length > 0 && finalWhere.length === 0) {
            return [];
        }

        const baseRelations: Record<string, any> = {
            createdBy: true,
            lastModifiedBy: true,
            ...(hasTenantsRelation ? { tenants: true } : {}),
            ...(opts.relations as any),
        };

        return (await this._repo.find({
            skip: opts.skip,
            take: opts.take,
            where: finalWhere,
            relations: baseRelations as any,
            order: opts.orderBy,
        })) || [];
    }
    private hasTenantsRelation(): boolean {
        return Boolean(
            this._repo?.metadata?.relations?.some(r => r.propertyName === 'tenants'),
        );
    }
    async getByInternalId(internalId: string, request?: any) {
        const hasTenantsRelation = this.hasTenantsRelation();
        const userId = request?.user?.id;
        const userTenantIds = Array.from(
            new Set(
                ((request?.user as any)?.tenants || []).map((t: any) => t?.id).filter(Boolean) as string[],
            ),
        );
        const where: FindOptionsWhere<E>[] = [];
        if (userId) {
            where.push({
                internalId: Equal(internalId),
                deleted: IsNull(),
                createdBy: { identifiedUser: Equal(userId) }
            } as any);
        }
        if (hasTenantsRelation && userTenantIds.length > 0) {
            where.push({
                internalId: Equal(internalId),
                deleted: IsNull(),
                tenants: { id: In(userTenantIds) },
            } as any);
        }
        where.push({
            internalId: Equal(internalId),
            deleted: IsNull(),
            createdBy: IsNull()
        } as any);
        const objeto_retorno = await this._repo.findOne({
            where,
            relations: {
                createdBy: true,
                lastModifiedBy: true,
                ...(hasTenantsRelation ? { tenants: true } : {}),
            } as any
        });
        if (objeto_retorno) {
            (objeto_retorno as any).__name = objeto_retorno.constructor.name;
        }
        return objeto_retorno;
    }
    /**
     * Marca registro com deletado. Posteriormente é removido da base principal em processo separado.
     */
    async delete(data: E, request?: any) {
        const old_data = (await this.getByInternalId(data.internalId, request));
        if (old_data) {
            old_data.deleted = true;
            return await this._repo.save(old_data);
        }
        return data;
    }

    toJSON() {

        return {
            // ...this,
        }
    }
}