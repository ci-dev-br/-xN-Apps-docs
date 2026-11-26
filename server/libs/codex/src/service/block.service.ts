import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Equal, IsNull, Repository } from "typeorm";
import { DaoFullAuditedServiceBase, Snapshot, SnapshotService } from "@ci/core";
import { Block } from "../models/block.entity";

@Injectable()
export class BlockService extends DaoFullAuditedServiceBase<Block> {
    constructor(
        snap: SnapshotService,
        @InjectRepository(Block)
        private readonly blockRepo: Repository<Block>,
    ) {
        super(snap, blockRepo);
    }

    /**
     * Retorna o histórico de snapshots (versões anteriores) de um Block pelo internalId.
     */
    async getSnapshots(internalId: string, request?: any): Promise<Snapshot[]> {
        if (!internalId) return [];
        const userId = request?.user?.id;
        const isPrivileged =
            request?.user?.roles?.includes('ADMIN') ||
            request?.user?.roles?.includes('MASTER') ||
            request?.user?.roles?.includes('DEVELOPER');

        const where: any[] = [];
        if (isPrivileged) {
            where.push({ internalId: Equal(internalId), deleted: IsNull() });
        } else {
            if (userId) {
                where.push({
                    internalId: Equal(internalId),
                    deleted: IsNull(),
                    createdBy: { identifiedUser: Equal(userId) },
                });
            }
            where.push({
                internalId: Equal(internalId),
                deleted: IsNull(),
                createdBy: IsNull(),
            });
        }

        const block = await this.blockRepo.findOne({
            where,
            relations: { snapshots: true },
        });

        const snapshots = block?.snapshots || [];
        return [...snapshots].sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
        });
    }
}
