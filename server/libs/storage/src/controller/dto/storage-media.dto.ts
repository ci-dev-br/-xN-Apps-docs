import { ApiProperty } from "@nestjs/swagger";
import { SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { StorageAsset } from "../../models/storage-asset.entity";

export class SyncPayloadDaoStorageAsset extends SyncPayloadDao<StorageAsset> {
    @ApiProperty({ type: StorageAsset })
    override data?: StorageAsset;
}

export class ObterListaStorageAsset {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<StorageAsset>[] | FindOptionsWhere<StorageAsset>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

export class InitUploadStorageMediaInputDto {
    @ApiProperty({ title: 'Nome do Arquivo', required: true })
    fileName: string;

    @ApiProperty({ title: 'MIME Type', required: false, nullable: true })
    mimeType?: string;

    @ApiProperty({ title: 'Tamanho Total (bytes)', required: false, nullable: true })
    totalSize?: number;

    @ApiProperty({ title: 'Total de Partes', required: true })
    totalChunks: number;

    @ApiProperty({ title: 'Categoria', required: false, nullable: true, enum: ['video', 'material', 'image', 'audio', 'other'] })
    category?: 'video' | 'material' | 'image' | 'audio' | 'other';

    @ApiProperty({ title: 'Módulo de Referência', required: false, nullable: true })
    referenciaModulo?: string;

    @ApiProperty({ title: 'ID de Referência', required: false, nullable: true })
    referenciaId?: string;

    @ApiProperty({ title: 'Processar com FFmpeg', required: false, nullable: true })
    transcodeVideo?: boolean;
}

export class InitUploadStorageMediaOutputDto {
    @ApiProperty({ required: false })
    uploadId: string;

    @ApiProperty({ required: false })
    chunkSizeRecommended: number;
}

export class UploadChunkStorageMediaInputDto {
    @ApiProperty({ required: true })
    uploadId: string;

    @ApiProperty({ required: true })
    chunkIndex: number;

    @ApiProperty({ required: true })
    chunkBase64: string;
}

export class UploadChunkStorageMediaOutputDto {
    @ApiProperty({ required: false })
    uploadId: string;

    @ApiProperty({ required: false })
    chunkIndex: number;

    @ApiProperty({ required: false })
    receivedBytes: number;

    @ApiProperty({ required: false })
    ok: boolean;
}

export class CompleteUploadStorageMediaInputDto {
    @ApiProperty({ required: true })
    uploadId: string;

    @ApiProperty({ required: false, nullable: true })
    transcodeVideo?: boolean;
}

export class ReadChunkStorageMediaInputDto {
    @ApiProperty({ required: true })
    assetId: string;

    @ApiProperty({ required: false, nullable: true })
    start?: number;

    @ApiProperty({ required: false, nullable: true })
    end?: number;
}

export class ReadChunkStorageMediaOutputDto {
    @ApiProperty({ required: false })
    assetId: string;

    @ApiProperty({ required: false })
    fileName?: string;

    @ApiProperty({ required: false })
    mimeType?: string;

    @ApiProperty({ required: false })
    start: number;

    @ApiProperty({ required: false })
    end: number;

    @ApiProperty({ required: false })
    totalBytes: number;

    @ApiProperty({ required: false })
    chunkBase64: string;
}

export class GetAssetInfoStorageMediaInputDto {
    @ApiProperty({ required: true })
    assetId: string;
}
