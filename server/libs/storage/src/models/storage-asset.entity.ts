import { Column, Entity } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";

/**
 * Ativo de mídia e material armazenado pelo serviço de Storage,
 * com suporte a processamento FFmpeg para vídeos e entrega em chunks.
 */
@Entity({ schema })
export class StorageAsset extends FullAuditedEntity {
    @ApiProperty({ title: 'Nome do Arquivo', description: 'Nome sanitizado do arquivo armazenado', nullable: true, required: false })
    @Column({ nullable: true })
    fileName?: string;

    @ApiProperty({ title: 'Nome Original', description: 'Nome original enviado pelo usuário', nullable: true, required: false })
    @Column({ nullable: true })
    originalFileName?: string;

    @ApiProperty({ title: 'MIME Type', description: 'Tipo MIME do arquivo (ex: video/mp4, application/pdf)', nullable: true, required: false })
    @Column({ nullable: true })
    mimeType?: string;

    @ApiProperty({ title: 'Categoria', description: 'Categoria do ativo (video, material, image, audio, other)', nullable: true, required: false })
    @Column({ nullable: true, default: 'other' })
    category?: string;

    @ApiProperty({ title: 'Tamanho (bytes)', description: 'Tamanho final do arquivo em bytes', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true, type: 'int8' })
    sizeBytes?: number;

    @ApiProperty({ title: 'Caminho de Armazenamento', description: 'Caminho relativo no diretório de storage', nullable: true, required: false })
    @Column({ nullable: true })
    storagePath?: string;

    @ApiProperty({ title: 'Caminho da Miniatura', description: 'Caminho relativo da miniatura gerada pelo FFmpeg', nullable: true, required: false })
    @Column({ nullable: true })
    posterPath?: string;

    @ApiProperty({ title: 'Miniatura (Data URL)', description: 'Poster JPEG gerado pelo FFmpeg em base64 para exibição imediata', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    posterDataUrl?: string;

    @ApiProperty({ title: 'Duração (segundos)', description: 'Duração do vídeo/áudio extraída via ffprobe', type: 'number', nullable: true, required: false })
    @Column({ nullable: true, type: 'float' })
    durationSeconds?: number;

    @ApiProperty({ title: 'Duração Formatada', description: 'Duração formatada (MM:SS ou HH:MM:SS)', nullable: true, required: false })
    @Column({ nullable: true })
    durationLabel?: string;

    @ApiProperty({ title: 'Largura', description: 'Largura do vídeo em pixels', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true })
    width?: number;

    @ApiProperty({ title: 'Altura', description: 'Altura do vídeo em pixels', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true })
    height?: number;

    @ApiProperty({ title: 'Codec de Vídeo', description: 'Codec de vídeo detectado/gerado pelo FFmpeg', nullable: true, required: false })
    @Column({ nullable: true })
    videoCodec?: string;

    @ApiProperty({ title: 'Codec de Áudio', description: 'Codec de áudio detectado/gerado pelo FFmpeg', nullable: true, required: false })
    @Column({ nullable: true })
    audioCodec?: string;

    @ApiProperty({ title: 'Transcodificado', description: 'Indica se o vídeo foi otimizado via FFmpeg', type: 'boolean', nullable: true, required: false })
    @Column({ nullable: true, default: false })
    transcoded?: boolean;

    @ApiProperty({ title: 'Status de Processamento', description: 'Estado do processamento (PENDING, PROCESSING, READY, FAILED)', nullable: true, required: false })
    @Column({ nullable: true, default: 'READY' })
    processingStatus?: string;

    @ApiProperty({ title: 'Erro de Processamento', description: 'Detalhes em caso de falha no processamento', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    processingError?: string;

    @ApiProperty({ title: 'Metadados FFmpeg', description: 'Metadados técnicos extraídos via ffprobe', nullable: true, required: false })
    @Column({ nullable: true, type: 'jsonb' })
    ffmpegMetadata?: any;

    @ApiProperty({ title: 'SHA-256', description: 'Hash SHA-256 do arquivo final', nullable: true, required: false })
    @Column({ nullable: true })
    sha256?: string;

    @ApiProperty({ title: 'Módulo de Referência', description: 'Nome do módulo proprietário (ex: Treinamento)', nullable: true, required: false })
    @Column({ nullable: true })
    referenciaModulo?: string;

    @ApiProperty({ title: 'ID de Referência', description: 'Identificador da entidade vinculada', nullable: true, required: false })
    @Column({ nullable: true })
    referenciaId?: string;
}
