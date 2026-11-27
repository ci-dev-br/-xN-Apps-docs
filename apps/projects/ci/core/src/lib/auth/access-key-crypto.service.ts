import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const DB_NAME = 'ci_access_keys_db';
const DB_VERSION = 1;
const STORE_NAME = 'keys';
const KEY_ALGORITHM = 'ECDSA-P256-SHA256';

export interface StoredAccessKeyRecord {
    chaveAcesso: string;
    privateKey: CryptoKey;
    publicKey: string;
    algorithm: string;
    createdAt: string;
}

export interface GeneratedKeyPairInfo {
    publicKey: string;
    algorithm: string;
}

export interface EphemeralKeyPair {
    privateKey: CryptoKey;
    publicKey: string;
    algorithm: string;
}

export interface SnapshotSignatureEnvelope {
    chaveAcesso: string;
    payloadHash: string;
    hash: string;
    signature: string;
    signedAt: string;
    algorithm: string;
}

/**
 * Serialização JSON canônica (chaves ordenadas recursivamente) para cálculo
 * determinístico de hash de snapshots entre cliente e servidor.
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    return arrayBufferToBase64(buffer)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
}

/**
 * Gerencia pares de chaves assimétricas (ECDSA P-256) vinculados a cada `chaveAcesso`.
 *
 * A chave privada é criada com `extractable: false` via Web Crypto API e persistida no IndexedDB,
 * impedindo exfiltração por scripts e garantindo que apenas o cliente detentor do acesso assine snapshots.
 */
@Injectable({
    providedIn: 'root',
})
export class AccessKeyCryptoService {
    private readonly isBrowser: boolean;
    private dbPromise?: Promise<IDBDatabase | null>;
    private lastHashByChave = new Map<string, string>();
    private readonly encoder = new TextEncoder();

    constructor(
        @Optional() @Inject(PLATFORM_ID) private readonly platformId?: Object,
    ) {
        this.isBrowser = this.platformId ? isPlatformBrowser(this.platformId) : typeof window !== 'undefined';
    }

    public get isSupported(): boolean {
        return (
            this.isBrowser &&
            typeof crypto !== 'undefined' &&
            !!crypto.subtle &&
            typeof indexedDB !== 'undefined'
        );
    }

    private openDb(): Promise<IDBDatabase | null> {
        if (!this.isSupported) return Promise.resolve(null);
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise<IDBDatabase | null>((resolve) => {
            try {
                const req = indexedDB.open(DB_NAME, DB_VERSION);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'chaveAcesso' });
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => {
                    this.dbPromise = undefined;
                    resolve(null);
                };
            } catch {
                this.dbPromise = undefined;
                resolve(null);
            }
        });

        return this.dbPromise;
    }

    private async getRecord(chaveAcesso: string): Promise<StoredAccessKeyRecord | null> {
        const db = await this.openDb();
        if (!db || !chaveAcesso) return null;

        return new Promise<StoredAccessKeyRecord | null>((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(chaveAcesso);
                req.onsuccess = () => resolve((req.result as StoredAccessKeyRecord) || null);
                req.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    private async putRecord(record: StoredAccessKeyRecord): Promise<boolean> {
        const db = await this.openDb();
        if (!db) return false;

        return new Promise<boolean>((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.put(record);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            } catch {
                resolve(false);
            }
        });
    }

    public async sha256Hex(text: string): Promise<string> {
        if (!this.isSupported) return '';
        const digest = await crypto.subtle.digest('SHA-256', this.encoder.encode(text));
        return arrayBufferToHex(digest);
    }

    public async generateEphemeralKeyPair(): Promise<EphemeralKeyPair | null> {
        if (!this.isSupported) return null;
        try {
            const pair = await crypto.subtle.generateKey(
                { name: 'ECDSA', namedCurve: 'P-256' },
                false,
                ['sign', 'verify'],
            );
            const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
            return {
                privateKey: pair.privateKey,
                publicKey: arrayBufferToBase64(spki),
                algorithm: KEY_ALGORITHM,
            };
        } catch (error) {
            console.warn('[AccessKeyCryptoService] Falha ao gerar par de chaves:', error);
            return null;
        }
    }

    public async bindKeyPair(chaveAcesso: string, keyPair: EphemeralKeyPair | null): Promise<boolean> {
        if (!chaveAcesso || !keyPair) return false;
        return this.putRecord({
            chaveAcesso,
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
            algorithm: keyPair.algorithm,
            createdAt: new Date().toISOString(),
        });
    }

    public async ensureKeyPair(chaveAcesso: string): Promise<GeneratedKeyPairInfo | null> {
        if (!this.isSupported || !chaveAcesso) return null;
        const existing = await this.getRecord(chaveAcesso);
        if (existing?.privateKey && existing?.publicKey) {
            return {
                publicKey: existing.publicKey,
                algorithm: existing.algorithm || KEY_ALGORITHM,
            };
        }
        const generated = await this.generateEphemeralKeyPair();
        if (!generated) return null;
        const saved = await this.bindKeyPair(chaveAcesso, generated);
        if (!saved) return null;
        return {
            publicKey: generated.publicKey,
            algorithm: generated.algorithm,
        };
    }

    public async hasPrivateKey(chaveAcesso?: string | null): Promise<boolean> {
        if (!chaveAcesso) return false;
        const existing = await this.getRecord(chaveAcesso);
        return Boolean(existing?.privateKey);
    }

    public async getPublicKey(chaveAcesso?: string | null): Promise<GeneratedKeyPairInfo | null> {
        if (!chaveAcesso) return null;
        const existing = await this.getRecord(chaveAcesso);
        if (!existing?.publicKey) return null;
        return {
            publicKey: existing.publicKey,
            algorithm: existing.algorithm || KEY_ALGORITHM,
        };
    }

    public async signSnapshot(
        chaveAcesso: string,
        data: any,
        prevHash?: string,
    ): Promise<SnapshotSignatureEnvelope | null> {
        if (!this.isSupported || !chaveAcesso) return null;
        const record = await this.getRecord(chaveAcesso);
        if (!record?.privateKey) return null;

        try {
            const normalized = data === undefined ? null : JSON.parse(JSON.stringify(data));
            const canonical = canonicalStringify(normalized);
            const payloadHash = await this.sha256Hex(canonical);
            const signedAt = new Date().toISOString();
            const chainPrev = prevHash ?? this.lastHashByChave.get(chaveAcesso) ?? '';
            const hash = await this.sha256Hex(`${chainPrev}|${payloadHash}|${signedAt}`);
            const signatureBuf = await crypto.subtle.sign(
                { name: 'ECDSA', hash: 'SHA-256' },
                record.privateKey,
                this.encoder.encode(hash),
            );

            this.lastHashByChave.set(chaveAcesso, hash);

            return {
                chaveAcesso,
                payloadHash,
                hash,
                signature: arrayBufferToBase64Url(signatureBuf),
                signedAt,
                algorithm: record.algorithm || KEY_ALGORITHM,
            };
        } catch (error) {
            console.warn('[AccessKeyCryptoService] Falha ao assinar snapshot:', error);
            return null;
        }
    }

    public async deleteKey(chaveAcesso?: string | null): Promise<void> {
        if (!chaveAcesso) return;
        this.lastHashByChave.delete(chaveAcesso);
        const db = await this.openDb();
        if (!db) return;

        await new Promise<void>((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.delete(chaveAcesso);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    }

    public async clearAllKeys(): Promise<void> {
        this.lastHashByChave.clear();
        const db = await this.openDb();
        if (!db) return;

        await new Promise<void>((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.clear();
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    }
}
