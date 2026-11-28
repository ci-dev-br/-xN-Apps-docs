/* tslint:disable */
/* eslint-disable */
export interface InitUploadStorageMediaInputDto {
  category?: ('video' | 'material' | 'image' | 'audio' | 'other') | null;
  fileName: string;
  mimeType?: string | null;
  referenciaId?: string | null;
  referenciaModulo?: string | null;
  totalChunks: number;
  totalSize?: number | null;
  transcodeVideo?: boolean | null;
}
