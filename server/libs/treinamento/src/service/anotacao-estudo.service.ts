import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Equal, IsNull, Repository } from "typeorm";
import { AnotacaoEstudo } from "../models/anotacao-estudo.entity";

@Injectable()
export class AnotacaoEstudoService extends DaoFullAuditedServiceBase<AnotacaoEstudo> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(AnotacaoEstudo)
        private readonly anotacaoRepo: Repository<AnotacaoEstudo>,
    ) {
        super(snap, anotacaoRepo);
    }

    override async sincronizar(data: AnotacaoEstudo, request?: any): Promise<AnotacaoEstudo> {
        const userId = request?.user?.id;
        if (userId && !data.userId) {
            data.userId = userId;
        }
        if (typeof data.timestampSegundos === 'number' && !data.timestampLabel) {
            const secs = Math.max(0, Math.floor(data.timestampSegundos));
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            data.timestampLabel = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return await super.sincronizar(data, request);
    }

    override async obterLista(options?: any, request?: any): Promise<AnotacaoEstudo[]> {
        const userId = request?.user?.id;
        const whereInput = options?.where;
        if (userId && whereInput && typeof whereInput === 'object' && !Array.isArray(whereInput)) {
            return await this.anotacaoRepo.find({
                where: {
                    ...whereInput,
                    userId: Equal(userId),
                    deleted: IsNull(),
                },
                order: { createdAt: 'DESC' },
                skip: options?.skip,
                take: options?.take,
            });
        }
        if (userId && !whereInput) {
            return await this.anotacaoRepo.find({
                where: { userId: Equal(userId), deleted: IsNull() },
                order: { createdAt: 'DESC' },
                skip: options?.skip,
                take: options?.take,
            });
        }
        return await super.obterLista(options, request);
    }
}
