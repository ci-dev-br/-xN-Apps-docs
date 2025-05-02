import { FindOptionsRelationByString, FindOptionsRelations } from "typeorm";
import { GetByInternalIdInputDto, SyncPayloadDao } from ".";
import { DaoFullAuditedServiceBase } from "./dao-full-audited-service-base";

export abstract class ControllerDaoBase<Service extends DaoFullAuditedServiceBase<E>, E> {
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