/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Website } from '../models/website';
export interface SiteMedia {

  /**
   * Texto alternativo para acessibilidade e SEO
   */
  altText?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Legenda ou notas sobre o arquivo
   */
  description?: string | null;

  /**
   * Nome do arquivo de mídia
   */
  filename?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Categoria do arquivo (image, pdf, video, audio, document)
   */
  mediaType?: ('image' | 'pdf' | 'video' | 'audio' | 'document') | null;

  /**
   * Tipo MIME do arquivo (ex: image/png, application/pdf)
   */
  mimeType?: string | null;

  /**
   * Tamanho do arquivo em bytes
   */
  sizeBytes?: number | null;

  /**
   * Representação legível do tamanho (ex: 1.2 MB)
   */
  sizeLabel?: string | null;
  tenants?: Array<string> | null;

  /**
   * Endereço público ou caminho do arquivo de mídia
   */
  url?: string | null;

  /**
   * Website associado ao arquivo de mídia
   */
  website?: Website | null;
}
