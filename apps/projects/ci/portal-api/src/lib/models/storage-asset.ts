/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface StorageAsset {

  /**
   * Codec de áudio detectado/gerado pelo FFmpeg
   */
  audioCodec?: string | null;

  /**
   * Categoria do ativo (video, material, image, audio, other)
   */
  category?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Duração formatada (MM:SS ou HH:MM:SS)
   */
  durationLabel?: string | null;

  /**
   * Duração do vídeo/áudio extraída via ffprobe
   */
  durationSeconds?: number | null;

  /**
   * Metadados técnicos extraídos via ffprobe
   */
  ffmpegMetadata?: {
} | null;

  /**
   * Nome sanitizado do arquivo armazenado
   */
  fileName?: string | null;

  /**
   * Altura do vídeo em pixels
   */
  height?: number | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Tipo MIME do arquivo (ex: video/mp4, application/pdf)
   */
  mimeType?: string | null;

  /**
   * Nome original enviado pelo usuário
   */
  originalFileName?: string | null;

  /**
   * Poster JPEG gerado pelo FFmpeg em base64 para exibição imediata
   */
  posterDataUrl?: string | null;

  /**
   * Caminho relativo da miniatura gerada pelo FFmpeg
   */
  posterPath?: string | null;

  /**
   * Detalhes em caso de falha no processamento
   */
  processingError?: string | null;

  /**
   * Estado do processamento (PENDING, PROCESSING, READY, FAILED)
   */
  processingStatus?: string | null;

  /**
   * Identificador da entidade vinculada
   */
  referenciaId?: string | null;

  /**
   * Nome do módulo proprietário (ex: Treinamento)
   */
  referenciaModulo?: string | null;

  /**
   * Hash SHA-256 do arquivo final
   */
  sha256?: string | null;

  /**
   * Tamanho final do arquivo em bytes
   */
  sizeBytes?: number | null;

  /**
   * Caminho relativo no diretório de storage
   */
  storagePath?: string | null;
  tenants?: Array<string> | null;

  /**
   * Indica se o vídeo foi otimizado via FFmpeg
   */
  transcoded?: boolean | null;

  /**
   * Codec de vídeo detectado/gerado pelo FFmpeg
   */
  videoCodec?: string | null;

  /**
   * Largura do vídeo em pixels
   */
  width?: number | null;
}
