/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Curso } from '../models/curso';
import { MaterialApoioItem } from '../models/material-apoio-item';
export interface Aula {
  createdAt?: Date | null;
  createdBy?: Credential | null;

  /**
   * Curso ao qual a aula pertence
   */
  curso?: Curso | null;

  /**
   * Identificador interno do curso pai
   */
  cursoId?: string | null;
  deleted?: boolean | null;

  /**
   * Resumo e orientações da aula
   */
  descricao?: string | null;

  /**
   * Duração formatada (MM:SS)
   */
  duracaoLabel?: string | null;

  /**
   * Duração total em segundos obtida via ffprobe/ffmpeg
   */
  duracaoSegundos?: number | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Lista de materiais de apoio armazenados no Storage
   */
  materiaisApoio?: Array<MaterialApoioItem> | null;

  /**
   * Posição sequencial da aula no curso
   */
  ordem?: number | null;
  tenants?: Array<string> | null;

  /**
   * Data URL da miniatura gerada pelo FFmpeg
   */
  thumbnailDataUrl?: string | null;

  /**
   * Título da aula
   */
  titulo?: string | null;

  /**
   * internalId do StorageAsset correspondente ao vídeo da aula
   */
  videoAssetId?: string | null;

  /**
   * Nome do arquivo de vídeo armazenado
   */
  videoFileName?: string | null;

  /**
   * Metadados técnicos extraídos via FFmpeg (resolução, codecs, tamanho)
   */
  videoMetadata?: {
} | null;
}
