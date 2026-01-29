import { FindOptionsRelationByString, FindOptionsRelations } from 'typeorm';
import { GetByInternalIdInputDto, SyncPayloadDao } from './entities';
import { DaoFullAuditedServiceBase } from './dao-full-audited-service-base';
import { DaoServiceBase } from './dao-service-base';

export abstract class ControllerDaoBase<Service extends (DaoFullAuditedServiceBase<E> | DaoServiceBase<E>), E> {
    constructor(
        private _service: Service,
    ) { }
    async Sync(entity: SyncPayloadDao<E>, request?: any) {
        try {
            return await this._service.sincronizar(entity.data, request);
        } catch (error) {
            return {
                status: 500,
                message: 'Falha',
                detahes: error.message,
                stack: error.stack
            } as any
        }
    }
    async GetList(options?: { skip?: number, take?: number, where?: any, relations?: FindOptionsRelations<E> | FindOptionsRelationByString, orderBy?: any }, request?: any) {
        return await this._service?.obterLista(options, request);
    }
    async GetByInternalId(payload: GetByInternalIdInputDto, request?: any) {
        if (this._service instanceof DaoFullAuditedServiceBase)
            return await this._service.getByInternalId(payload.internalId, request);
        else if (this._service instanceof DaoServiceBase)
            return await this._service.getById(payload.internalId, request);

    }
    async Delete(item: E, request?: any) {
        return await this._service.delete(item, request);
    }
} 