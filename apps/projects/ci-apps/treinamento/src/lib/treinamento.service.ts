import { Injectable, Optional } from '@angular/core';
import {
  AnotacaoEstudo,
  AnotacaoEstudoService,
  Aula,
  AulaService,
  Curso,
  CursoService,
  GetCatalogoCursoInputDto,
  GetCatalogoCursoOutputDto,
  Instrutor,
  InstrutorService,
  Matricula,
  MatriculaService,
  StorageAsset,
  StorageMediaService,
  Turma,
  TurmaService,
} from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

export interface UploadProgressCallback {
  (percent: number, stage: string): void;
}

@Injectable({
  providedIn: 'root'
})
export class TreinamentoService {
  private readonly chunkCache = new Map<string, string>();

  constructor(
    @Optional() private readonly cursoApi?: CursoService,
    @Optional() private readonly aulaApi?: AulaService,
    @Optional() private readonly instrutorApi?: InstrutorService,
    @Optional() private readonly turmaApi?: TurmaService,
    @Optional() private readonly matriculaApi?: MatriculaService,
    @Optional() private readonly storageMediaApi?: StorageMediaService,
    @Optional() private readonly anotacaoApi?: AnotacaoEstudoService,
  ) { }

  get hasApi(): boolean {
    return Boolean(this.cursoApi && this.storageMediaApi);
  }

  async getCatalogo(input: GetCatalogoCursoInputDto = {}): Promise<GetCatalogoCursoOutputDto> {
    if (!this.cursoApi) return { cursos: [], matriculas: [] };
    return await lastValueFrom(this.cursoApi.getCatalogo({ body: input }));
  }

  async getMeuPerfilInstrutor(): Promise<Instrutor | undefined> {
    if (!this.instrutorApi) return undefined;
    return await lastValueFrom(this.instrutorApi.meuPerfil());
  }

  async salvarInstrutor(data: Instrutor): Promise<Instrutor | undefined> {
    if (!this.instrutorApi) return undefined;
    return await lastValueFrom(this.instrutorApi.sync({ body: { data } }));
  }

  async salvarCurso(data: Curso): Promise<Curso | undefined> {
    if (!this.cursoApi) return undefined;
    return await lastValueFrom(this.cursoApi.sync({ body: { data } }));
  }

  async excluirCurso(curso: Curso): Promise<Curso | undefined> {
    if (!this.cursoApi) return undefined;
    return await lastValueFrom(this.cursoApi.delete({ body: curso }));
  }

  async carregarCurso(internalId: string): Promise<Curso | undefined> {
    if (!this.cursoApi) return undefined;
    return await lastValueFrom(this.cursoApi.getByInternalId({ body: { internalId } }));
  }

  async salvarAula(data: Aula): Promise<Aula | undefined> {
    if (!this.aulaApi) return undefined;
    return await lastValueFrom(this.aulaApi.sync({ body: { data } }));
  }

  async excluirAula(aula: Aula): Promise<Aula | undefined> {
    if (!this.aulaApi) return undefined;
    return await lastValueFrom(this.aulaApi.delete({ body: aula }));
  }

  async anexarVideoAula(aulaId: string, assetId: string): Promise<Aula | undefined> {
    if (!this.aulaApi) return undefined;
    return await lastValueFrom(this.aulaApi.anexarVideo({ body: { aulaId, assetId } }));
  }

  async anexarMaterialAula(aulaId: string, assetId: string, descricao?: string): Promise<Aula | undefined> {
    if (!this.aulaApi) return undefined;
    return await lastValueFrom(this.aulaApi.anexarMaterial({ body: { aulaId, assetId, descricao } }));
  }

  async removerMaterialAula(aulaId: string, assetId: string): Promise<Aula | undefined> {
    if (!this.aulaApi) return undefined;
    return await lastValueFrom(this.aulaApi.removerMaterial({ body: { aulaId, assetId } }));
  }

  async salvarTurma(data: Turma): Promise<Turma | undefined> {
    if (!this.turmaApi) return undefined;
    return await lastValueFrom(this.turmaApi.sync({ body: { data } }));
  }

  async excluirTurma(turma: Turma): Promise<Turma | undefined> {
    if (!this.turmaApi) return undefined;
    return await lastValueFrom(this.turmaApi.delete({ body: turma }));
  }

  async matricular(cursoId: string, turmaId?: string): Promise<Matricula | undefined> {
    if (!this.matriculaApi) return undefined;
    return await lastValueFrom(this.matriculaApi.matricular({ body: { cursoId, turmaId } }));
  }

  async registrarProgresso(
    cursoId: string,
    aulaId: string,
    concluida?: boolean,
    ultimoTempoSegundos?: number,
  ): Promise<Matricula | undefined> {
    if (!this.matriculaApi) return undefined;
    return await lastValueFrom(
      this.matriculaApi.registrarProgresso({
        body: { cursoId, aulaId, concluida, ultimoTempoSegundos },
      })
    );
  }

  async listarAnotacoesCurso(cursoId?: string, aulaId?: string): Promise<AnotacaoEstudo[]> {
    if (!this.anotacaoApi) return [];
    const where: any = {};
    if (cursoId) where.cursoId = cursoId;
    if (aulaId) where.aulaId = aulaId;
    return await lastValueFrom(this.anotacaoApi.getList({ body: { where } }));
  }

  async salvarAnotacao(data: AnotacaoEstudo): Promise<AnotacaoEstudo | undefined> {
    if (!this.anotacaoApi) return undefined;
    return await lastValueFrom(this.anotacaoApi.sync({ body: { data } }));
  }

  /**
   * Realiza upload em partes para o serviço de Storage.
   * Quando `category === 'video'`, o backend processa via FFmpeg (MP4 H.264/AAC + miniatura + metadados).
   */
  async uploadArquivoStorage(
    file: File,
    category: 'video' | 'material',
    options?: {
      referenciaModulo?: string;
      referenciaId?: string;
      transcodeVideo?: boolean;
      onProgress?: UploadProgressCallback;
    }
  ): Promise<StorageAsset> {
    if (!this.storageMediaApi) {
      throw new Error('Serviço StorageMediaService indisponível.');
    }

    const chunkSize = 1536 * 1024; // 1.5 MB por parte (mantém cada POST abaixo de 15s e 50MB)
    const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
    options?.onProgress?.(2, 'Inicializando sessão no Storage...');

    const init = await lastValueFrom(
      this.storageMediaApi.initUpload({
        body: {
          fileName: file.name,
          mimeType: file.type || (category === 'video' ? 'video/mp4' : 'application/octet-stream'),
          totalSize: file.size,
          totalChunks,
          category,
          referenciaModulo: options?.referenciaModulo || 'Treinamento',
          referenciaId: options?.referenciaId,
          transcodeVideo: options?.transcodeVideo !== false,
        }
      })
    );

    for (let idx = 0; idx < totalChunks; idx++) {
      const start = idx * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const buffer = await file.slice(start, end).arrayBuffer();
      const base64 = this.arrayBufferToBase64(buffer);

      await lastValueFrom(
        this.storageMediaApi.uploadChunk({
          body: {
            uploadId: init.uploadId!,
            chunkIndex: idx,
            chunkBase64: base64,
          }
        })
      );

      const pct = Math.min(84, Math.round(((idx + 1) / totalChunks) * 82) + 2);
      options?.onProgress?.(pct, `Enviando parte ${idx + 1} de ${totalChunks}...`);
    }

    options?.onProgress?.(
      90,
      category === 'video'
        ? 'Processando vídeo com FFmpeg (transcodificação e miniatura)...'
        : 'Validando e finalizando armazenamento...'
    );

    const asset = await lastValueFrom(
      this.storageMediaApi.completeUpload({
        body: {
          uploadId: init.uploadId!,
          transcodeVideo: options?.transcodeVideo !== false,
        }
      })
    );

    options?.onProgress?.(100, 'Concluído!');
    return asset;
  }

  /**
   * Carrega vídeo ou material de apoio do Storage via ReadChunk (POST) e cria Blob URL local.
   */
  async carregarMidiaBlobUrl(
    assetId: string,
    onProgress?: (percent: number) => void,
  ): Promise<{ url: string; fileName: string; mimeType: string; sizeBytes: number }> {
    if (!this.storageMediaApi) {
      throw new Error('Serviço StorageMediaService indisponível.');
    }
    if (this.chunkCache.has(assetId)) {
      const info = await lastValueFrom(this.storageMediaApi.getAssetInfo({ body: { assetId } }));
      onProgress?.(100);
      return {
        url: this.chunkCache.get(assetId)!,
        fileName: info.originalFileName || info.fileName || 'arquivo',
        mimeType: info.mimeType || 'application/octet-stream',
        sizeBytes: Number(info.sizeBytes || 0),
      };
    }

    const info = await lastValueFrom(this.storageMediaApi.getAssetInfo({ body: { assetId } }));
    const totalBytes = Number(info.sizeBytes || 0);
    const mimeType = info.mimeType || 'application/octet-stream';
    const fileName = info.originalFileName || info.fileName || 'arquivo';
    const parts: BlobPart[] = [];

    if (totalBytes > 0) {
      const chunkBytes = 1536 * 1024;
      let offset = 0;
      while (offset < totalBytes) {
        const res = await lastValueFrom(
          this.storageMediaApi.readChunk({
            body: {
              assetId,
              start: offset,
              end: Math.min(totalBytes - 1, offset + chunkBytes - 1),
            }
          })
        );
        const bytes = this.base64ToUint8Array(res.chunkBase64 || '');
        parts.push(bytes as unknown as BlobPart);
        offset = Number(res.end ?? offset) + 1;
        onProgress?.(Math.min(100, Math.round((offset / totalBytes) * 100)));
        if (bytes.length === 0) break;
      }
    }

    const blob = new Blob(parts, { type: mimeType });
    const url = URL.createObjectURL(blob);
    this.chunkCache.set(assetId, url);
    onProgress?.(100);
    return { url, fileName, mimeType, sizeBytes: totalBytes };
  }

  async baixarMaterial(assetId: string, fallbackName?: string): Promise<void> {
    const media = await this.carregarMidiaBlobUrl(assetId);
    const a = document.createElement('a');
    a.href = media.url;
    a.download = fallbackName || media.fileName;
    a.click();
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const sliceSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += sliceSize) {
      const sub = bytes.subarray(i, Math.min(i + sliceSize, bytes.length));
      binary += String.fromCharCode(...sub);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    if (!base64) return new Uint8Array(0);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
