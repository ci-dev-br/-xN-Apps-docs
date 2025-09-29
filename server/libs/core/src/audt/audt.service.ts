import { Injectable } from "@nestjs/common";
import { FullAuditedEntity } from "../../../manager/src/dao/entities";
@Injectable()
export class AudtService {
    constructor(
        // chaveAcesso: ChaveAc
    ) {
    }
    doSync<T>(data: T, req: any, modify = false) {
        if (modify)
            (data as FullAuditedEntity).lastModifiedBy = { id: req.chaveAcesso }
        else
            (data as FullAuditedEntity).createdBy = { id: req.chaveAcesso }
        return data;
    }
}