import { Injectable, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FullAuditedEntity, Snapshot } from "./entities";
import { Repository } from "typeorm";
import { createHash, createPublicKey, verify } from "crypto";
import { Request } from "express";
import { Credential } from "@ci/core/audt/credential.entity";

export interface ClientSnapshotSignatureMeta {
    hash?: string;
    payloadHash?: string;
    signature?: string;
    signedAt?: string;
    algorithm?: string;
    chaveAcesso?: string;
}

/**
 * Serialização JSON canônica (chaves ordenadas recursivamente) para cálculo determinístico de hash entre cliente e servidor.
 */
export function canonicalStringify(value: any): string {
    if (value === null || value === undefined) {
        return 'null';
    }
    if (value instanceof Date) {
        return JSON.stringify(value.toISOString());
    }
    if (typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return '[' + value.map(item => (
            item === undefined || typeof item === 'function' || typeof item === 'symbol'
                ? 'null'
                : canonicalStringify(item)
        )).join(',') + ']';
    }
    const keys = Object.keys(value)
        .filter(k => value[k] !== undefined && typeof value[k] !== 'function' && typeof value[k] !== 'symbol')
        .sort();
    return '{' + keys.map(k => `${JSON.stringify(k)}:${canonicalStringify(value[k])}`).join(',') + '}';
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
        @Optional()
        @InjectRepository(Credential)
        private readonly credentialRepo?: Repository<Credential>,
    ) {
        this.carregarUltimoHash();
    }
    async carregarUltimoHash() {
        try {
            const hash = await this.snapRepo.findOne({ where: {}, order: { createdAt: 'DESC' } });
            if (!!hash && !!hash.hash)
                this.lastSnapshotHash = hash.hash;
        } catch (error) {
            console.trace(error);
        }
    }

    private extractClientSignatureMeta(request?: Request): ClientSnapshotSignatureMeta | undefined {
        const headers = (request as any)?.headers;
        if (!headers) return undefined;
        const hash = headers['x-snapshot-hash'] as string | undefined;
        const payloadHash = headers['x-snapshot-payload-hash'] as string | undefined;
        const signature = headers['x-snapshot-signature'] as string | undefined;
        const signedAt = headers['x-snapshot-timestamp'] as string | undefined;
        const algorithm = headers['x-snapshot-algorithm'] as string | undefined;
        const chaveAcesso = (headers['x-access-key'] as string | undefined) || (request as any)?.chaveAcesso;
        if (!hash && !signature && !payloadHash) return undefined;
        return { hash, payloadHash, signature, signedAt, algorithm, chaveAcesso };
    }

    private async verifyClientSignature(
        meta: ClientSnapshotSignatureMeta,
        request?: Request,
    ): Promise<boolean | null> {
        if (!meta?.signature || !meta?.hash || !meta?.chaveAcesso || !this.credentialRepo) {
            return null;
        }
        try {
            const cred = await this.credentialRepo.findOne({ where: { id: meta.chaveAcesso } });
            if (!cred?.publicKey) {
                return null;
            }
            const rawBodyData = (request as any)?.body?.data;
            if (meta.payloadHash && rawBodyData !== undefined) {
                const normalizedInput = JSON.parse(JSON.stringify(rawBodyData));
                const expectedPayloadHash = createHash('sha256')
                    .update(canonicalStringify(normalizedInput))
                    .digest('hex');
                if (expectedPayloadHash !== meta.payloadHash) {
                    return false;
                }
            }
            const trimmedKey = cred.publicKey.trim();
            const keyObject = trimmedKey.startsWith('-----BEGIN')
                ? createPublicKey(trimmedKey)
                : trimmedKey.startsWith('{')
                    ? createPublicKey({ key: JSON.parse(trimmedKey), format: 'jwk' })
                    : createPublicKey({
                        key: Buffer.from(trimmedKey, 'base64'),
                        format: 'der',
                        type: 'spki',
                    });

            const sigBuffer = Buffer.from(meta.signature, 'base64url');
            return verify(
                'sha256',
                Buffer.from(meta.hash, 'utf8'),
                { key: keyObject, dsaEncoding: 'ieee-p1363' },
                sigBuffer,
            );
        } catch (err) {
            console.warn('[SnapshotService] Falha ao verificar assinatura do snapshot:', (err as any)?.message || err);
            return false;
        }
    }

    async snapshot<T extends FullAuditedEntity>(
        entidade: T | any,
        request: Request, repo?: Repository<T>,
    ) {
        try {
            const json_snapshot = JSON.parse(JSON.stringify(entidade));
            const canonical_json = canonicalStringify(json_snapshot);
            const momento = new Date().toISOString();
            const payloadHash = createHash('sha256').update(canonical_json).digest('hex');
            const hash = createHash('sha256')
                .update(`${this.lastSnapshotHash || ''}|${payloadHash}|${momento}`)
                .digest('hex');

            const chave_acesso = (request as any)?.chaveAcesso;
            const clientMeta = this.extractClientSignatureMeta(request);
            const signatureVerified = clientMeta
                ? await this.verifyClientSignature(clientMeta, request)
                : null;

            const snap = this.snapRepo.create({
                snap: json_snapshot,
                hash: clientMeta?.hash || hash,
                payloadHash: clientMeta?.payloadHash || payloadHash,
                signature: clientMeta?.signature || null,
                signatureAlgorithm: clientMeta?.algorithm || null,
                clientSignedAt: clientMeta?.signedAt || null,
                signatureVerified,
                createdBy: chave_acesso ? ({ id: chave_acesso } as any) : undefined,
            });
            const snap_saved = await this.snapRepo.save(snap);
            if (entidade instanceof FullAuditedEntity && repo) {
                if (!!entidade && !entidade.snapshots) entidade.snapshots = [];
                entidade.snapshots.push(snap_saved);
                await repo.save(entidade as T);
            }
            this.lastSnapshotHash = snap_saved?.hash || hash;
        } catch (error) {
            console.trace(error);
        }
    }
    async prepareToSync(entidade: any, request: Request) {
        if (entidade instanceof FullAuditedEntity) {
            await this.snapshot(entidade, request);
        }
    }
}