import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Oportunidade } from "../models/oportunidade";
import { EstagioOportunidade } from "../models/estagio-oportunidade";

/**
 * Serviço de Oportunidade de CRM
 */
@Injectable()
export class OportunidadeService extends DaoFullAuditedServiceBase<Oportunidade> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Oportunidade)
        repository: Repository<Oportunidade>
    ) {
        super(snap, repository);
    }

    override async sincronizar(data: Oportunidade, request?: any): Promise<Oportunidade> {
        if (!data) {
            return await super.sincronizar(data, request);
        }

        const payload: Oportunidade = { ...data };
        if (!payload.internalId) {
            delete payload.internalId;
            payload.dataMudancaEtapa = payload.dataMudancaEtapa || new Date();
            if (payload.estagio === EstagioOportunidade.GANHO) {
                payload.probabilidade = payload.probabilidade ?? 100;
                payload.dataFechamento = payload.dataFechamento || new Date();
            } else if (payload.estagio === EstagioOportunidade.PERDIDO) {
                payload.probabilidade = payload.probabilidade ?? 0;
                payload.dataFechamento = payload.dataFechamento || new Date();
            }
        } else {
            const atual = await this._repo.findOne({
                where: { internalId: payload.internalId } as any,
            });
            if (atual && payload.estagio !== undefined && payload.estagio !== atual.estagio) {
                payload.dataMudancaEtapa = new Date();
                if (
                    payload.estagio === EstagioOportunidade.GANHO ||
                    payload.estagio === EstagioOportunidade.PERDIDO
                ) {
                    payload.dataFechamento = new Date();
                    if (payload.estagio === EstagioOportunidade.GANHO && payload.probabilidade === undefined) {
                        payload.probabilidade = 100;
                    }
                } else if (
                    atual.estagio === EstagioOportunidade.GANHO ||
                    atual.estagio === EstagioOportunidade.PERDIDO
                ) {
                    payload.dataFechamento = null;
                }
            }
        }

        return await super.sincronizar(payload, request);
    }
}
