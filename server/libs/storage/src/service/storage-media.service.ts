import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import { Repository } from "typeorm";
import { StorageAsset } from "../models/storage-asset.entity";
import { FfmpegMediaService } from "./ffmpeg-media.service";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync } from "node:fs";
import * as fs from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import {
    CompleteUploadStorageMediaInputDto,
    InitUploadStorageMediaInputDto,
    InitUploadStorageMediaOutputDto,
    ReadChunkStorageMediaInputDto,
    ReadChunkStorageMediaOutputDto,
    UploadChunkStorageMediaInputDto,
    UploadChunkStorageMediaOutputDto,
} from "../controller/dto/storage-media.dto";

interface PendingUploadSession {
    uploadId: string;
    fileName: string;
    originalFileName: string;
    mimeType: string;
    totalSize: number;
    totalChunks: number;
    category: string;
    referenciaModulo?: string;
    referenciaId?: string;
    transcodeVideo: boolean;
    tempDir: string;
    receivedChunks: Set<number>;
    userId?: string;
    chaveAcesso?: string;
}

@Injectable()
export class StorageMediaService extends DaoFullAuditedServiceBase<StorageAsset> {
    private readonly storageRootDir: string;
    private readonly uploadsRootDir: string;
    private readonly assetsRootDir: string;
    private readonly uploadSessions = new Map<string, PendingUploadSession>();

    constructor(
        snap: SnapshotService,
        @InjectRepository(StorageAsset)
        repository: Repository<StorageAsset>,
        private readonly ffmpegMedia: FfmpegMediaService,
    ) {
        super(snap, repository);
        this.storageRootDir = resolve(process.env.STORAGE_DATA_DIR || join(process.cwd(), 'storage-data'));
        this.uploadsRootDir = join(this.storageRootDir, 'uploads');
        this.assetsRootDir = join(this.storageRootDir, 'assets');
        mkdirSync(this.uploadsRootDir, { recursive: true });
        mkdirSync(this.assetsRootDir, { recursive: true });
    }

    private sanitizeFileName(rawName: string): string {
        const base = basename(rawName || 'arquivo.bin');
        return base.replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    private resolveAssetAbsolutePath(relPath: string): string {
        const candidate = resolve(this.storageRootDir, relPath);
        if (!candidate.startsWith(this.storageRootDir)) {
            throw new BadRequestException('Caminho de ativo inválido.');
        }
        return candidate;
    }

    async initUpload(input: InitUploadStorageMediaInputDto, request?: any): Promise<InitUploadStorageMediaOutputDto> {
        if (!input?.fileName || !input?.totalChunks || input.totalChunks < 1) {
            throw new BadRequestException('Informe fileName e totalChunks válido.');
        }

        const uploadId = randomUUID();
        const sanitized = this.sanitizeFileName(input.fileName);
        const tempDir = join(this.uploadsRootDir, uploadId);
        await fs.mkdir(tempDir, { recursive: true });

        const inferredCategory = input.category || (
            (input.mimeType || '').startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(sanitized)
                ? 'video'
                : 'material'
        );

        this.uploadSessions.set(uploadId, {
            uploadId,
            fileName: sanitized,
            originalFileName: input.fileName,
            mimeType: input.mimeType || 'application/octet-stream',
            totalSize: Number(input.totalSize || 0),
            totalChunks: Number(input.totalChunks),
            category: inferredCategory,
            referenciaModulo: input.referenciaModulo,
            referenciaId: input.referenciaId,
            transcodeVideo: input.transcodeVideo !== false,
            tempDir,
            receivedChunks: new Set<number>(),
            userId: request?.user?.id,
            chaveAcesso: request?.chaveAcesso,
        });

        return {
            uploadId,
            chunkSizeRecommended: 2 * 1024 * 1024, // 2 MB por chunk
        };
    }

    async uploadChunk(input: UploadChunkStorageMediaInputDto): Promise<UploadChunkStorageMediaOutputDto> {
        const session = this.uploadSessions.get(input?.uploadId);
        if (!session) {
            throw new NotFoundException('Sessão de upload não encontrada ou expirada.');
        }

        const idx = Number(input.chunkIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx >= session.totalChunks) {
            throw new BadRequestException('Índice de chunk inválido.');
        }

        const cleanBase64 = (input.chunkBase64 || '').includes('base64,')
            ? input.chunkBase64.split('base64,')[1]
            : input.chunkBase64;
        const buf = Buffer.from(cleanBase64 || '', 'base64');
        const partPath = join(session.tempDir, `part-${String(idx).padStart(6, '0')}`);
        await fs.writeFile(partPath, buf);
        session.receivedChunks.add(idx);

        return {
            uploadId: session.uploadId,
            chunkIndex: idx,
            receivedBytes: buf.length,
            ok: true,
        };
    }

    async completeUpload(input: CompleteUploadStorageMediaInputDto, request?: any): Promise<StorageAsset> {
        const session = this.uploadSessions.get(input?.uploadId);
        if (!session) {
            throw new NotFoundException('Sessão de upload não encontrada.');
        }

        for (let i = 0; i < session.totalChunks; i++) {
            const partPath = join(session.tempDir, `part-${String(i).padStart(6, '0')}`);
            if (!existsSync(partPath)) {
                throw new BadRequestException(`Parte ${i} do upload está ausente.`);
            }
        }

        const assetFolderId = randomUUID();
        const assetDir = join(this.assetsRootDir, assetFolderId);
        await fs.mkdir(assetDir, { recursive: true });

        const ext = extname(session.fileName) || (session.category === 'video' ? '.mp4' : '.bin');
        const originalPath = join(assetDir, session.category === 'video' ? `source${ext}` : session.fileName);

        // Concatena os chunks em ordem sem manter o arquivo inteiro em memória
        const writeHandle = await fs.open(originalPath, 'w');
        const hash = createHash('sha256');
        let rawTotalBytes = 0;
        try {
            for (let i = 0; i < session.totalChunks; i++) {
                const partPath = join(session.tempDir, `part-${String(i).padStart(6, '0')}`);
                const chunkBuf = await fs.readFile(partPath);
                await writeHandle.write(chunkBuf);
                hash.update(chunkBuf);
                rawTotalBytes += chunkBuf.length;
            }
        } finally {
            await writeHandle.close();
            await fs.rm(session.tempDir, { recursive: true, force: true }).catch(() => { });
            this.uploadSessions.delete(session.uploadId);
        }

        let finalPath = originalPath;
        let finalFileName = session.fileName;
        let finalMimeType = session.mimeType;
        let finalSizeBytes = rawTotalBytes;
        let posterRelPath: string | undefined;
        let posterDataUrl: string | undefined;
        let durationSeconds: number | undefined;
        let durationLabel: string | undefined;
        let width: number | undefined;
        let height: number | undefined;
        let videoCodec: string | undefined;
        let audioCodec: string | undefined;
        let transcoded = false;
        let ffmpegMetadata: any;
        let processingStatus = 'READY';
        let processingError: string | undefined;

        const isVideo = session.category === 'video' || session.mimeType.startsWith('video/');
        if (isVideo) {
            try {
                const shouldTranscode = input.transcodeVideo !== undefined
                    ? Boolean(input.transcodeVideo)
                    : session.transcodeVideo;
                const processed = await this.ffmpegMedia.processUploadedVideo(originalPath, assetDir, shouldTranscode);
                finalPath = processed.finalVideoPath;
                finalSizeBytes = processed.sizeBytes;
                transcoded = processed.transcoded;
                if (processed.transcoded || finalPath.endsWith('.mp4')) {
                    finalMimeType = 'video/mp4';
                    if (!finalFileName.toLowerCase().endsWith('.mp4')) {
                        finalFileName = `${finalFileName.replace(/\.[^.]+$/, '')}.mp4`;
                    }
                }
                if (processed.posterPath) {
                    posterRelPath = relative(this.storageRootDir, processed.posterPath).replace(/\\/g, '/');
                }
                posterDataUrl = processed.posterDataUrl;
                durationSeconds = processed.metadata.durationSeconds;
                durationLabel = processed.metadata.durationLabel;
                width = processed.metadata.width;
                height = processed.metadata.height;
                videoCodec = processed.metadata.videoCodec;
                audioCodec = processed.metadata.audioCodec;
                ffmpegMetadata = processed.metadata;

                // Remove o arquivo bruto original caso uma versão MP4 otimizada tenha sido gerada
                if (finalPath !== originalPath && existsSync(originalPath)) {
                    await fs.rm(originalPath, { force: true }).catch(() => { });
                }
            } catch (err: any) {
                processingStatus = 'READY';
                processingError = err?.message || 'Erro ao processar vídeo via FFmpeg; mantido arquivo original.';
            }
        }

        const relStoragePath = relative(this.storageRootDir, finalPath).replace(/\\/g, '/');
        const finalHash = finalPath === originalPath
            ? hash.digest('hex')
            : await this.computeFileSha256(finalPath);

        const assetEntity: StorageAsset = {
            fileName: finalFileName,
            originalFileName: session.originalFileName,
            mimeType: finalMimeType,
            category: session.category,
            sizeBytes: finalSizeBytes,
            storagePath: relStoragePath,
            posterPath: posterRelPath,
            posterDataUrl,
            durationSeconds,
            durationLabel,
            width,
            height,
            videoCodec,
            audioCodec,
            transcoded,
            processingStatus,
            processingError,
            ffmpegMetadata,
            sha256: finalHash,
            referenciaModulo: session.referenciaModulo,
            referenciaId: session.referenciaId,
        } as StorageAsset;

        return await this.sincronizar(assetEntity, request);
    }

    private computeFileSha256(filePath: string): Promise<string> {
        return new Promise((resolveHash, rejectHash) => {
            const hash = createHash('sha256');
            const stream = createReadStream(filePath);
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolveHash(hash.digest('hex')));
            stream.on('error', rejectHash);
        });
    }

    async getAssetInfo(assetId: string, request?: any): Promise<StorageAsset> {
        const asset = await this.getByInternalId(assetId, request);
        if (!asset) {
            throw new NotFoundException('Ativo de mídia não encontrado.');
        }
        return asset;
    }

    async readChunk(input: ReadChunkStorageMediaInputDto, request?: any): Promise<ReadChunkStorageMediaOutputDto> {
        const asset = await this.getAssetInfo(input.assetId, request);
        if (!asset.storagePath) {
            throw new NotFoundException('Arquivo físico do ativo não localizado.');
        }
        const absPath = this.resolveAssetAbsolutePath(asset.storagePath);
        if (!existsSync(absPath)) {
            throw new NotFoundException('Arquivo não encontrado no armazenamento.');
        }

        const stats = await fs.stat(absPath);
        const totalBytes = stats.size;
        if (totalBytes === 0) {
            return {
                assetId: asset.internalId!,
                fileName: asset.fileName,
                mimeType: asset.mimeType,
                start: 0,
                end: 0,
                totalBytes: 0,
                chunkBase64: '',
            };
        }

        const MAX_CHUNK = 2 * 1024 * 1024; // 2 MB por leitura
        const start = Math.max(0, Math.min(Number(input.start || 0), totalBytes - 1));
        const requestedEnd = input.end !== undefined && input.end !== null
            ? Number(input.end)
            : start + MAX_CHUNK - 1;
        const end = Math.max(start, Math.min(requestedEnd, start + MAX_CHUNK - 1, totalBytes - 1));
        const length = end - start + 1;

        const handle = await fs.open(absPath, 'r');
        try {
            const buffer = Buffer.alloc(length);
            await handle.read(buffer, 0, length, start);
            return {
                assetId: asset.internalId!,
                fileName: asset.fileName,
                mimeType: asset.mimeType,
                start,
                end,
                totalBytes,
                chunkBase64: buffer.toString('base64'),
            };
        } finally {
            await handle.close();
        }
    }
}
