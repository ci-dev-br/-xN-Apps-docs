import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FullAuditedEntity, Snapshot } from "./entities";
import { Repository } from "typeorm";
import { createHash } from "crypto";
import { Request } from "express";

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
    async snapshot(entidade: FullAuditedEntity | any, request: Request) {
        const json_snapshot = JSON.parse(JSON.stringify(entidade, null, 2));
        const moment = new Date().toISOString();
        const hash = createHash('sha256').update([this.lastSnapshotHash || ''] + json_snapshot + moment).digest('hex').toString();
        const user_id: string | undefined = (request as any)?.user?.id;
        const chave_acesso = (request as any).chaveAcesso
        const snap = this.snapRepo.create({
            snap: json_snapshot,
            hash: hash,
            createdBy: chave_acesso,
        })
        this.lastSnapshotHash = hash;
        this.snapRepo.save(snap);
    }
    async prepareToSync(entidade: any, request: Request) {
        if (entidade instanceof FullAuditedEntity) {
            await this.snapshot(entidade, request);
        }
    }
}