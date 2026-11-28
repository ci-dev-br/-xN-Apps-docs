import { Component, ElementRef, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AnotacaoEstudo,
  AnotacaoEstudoService,
  Aula,
  Curso,
  CursoService,
  MaterialApoioItem,
  Matricula,
  MatriculaService,
  StorageMediaService,
} from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  reviewsCount: number;
  flipped?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  membersCount: number;
  activeTopic: string;
  meetingSchedule: string;
  isMember?: boolean;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  content: string;
  updatedAt: string;
  tags: string[];
  cursoId?: string | null;
  cursoTitulo?: string | null;
  aulaId?: string | null;
  aulaTitulo?: string | null;
  timestampSegundos?: number | null;
  timestampLabel?: string | null;
  raw?: AnotacaoEstudo;
}

@Component({
  selector: 'ci-estudos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './estudos.component.html',
  styleUrls: ['./estudos.component.scss']
})
export class EstudosComponent implements OnInit, OnDestroy {
  @ViewChild('estudosVideoRef') estudosVideoRef?: ElementRef<HTMLVideoElement>;

  activeTab: 'aulas' | 'metas' | 'flashcards' | 'turmas' | 'caderno' = 'aulas';

  // --- Integração com Treinamento & Aulas ---
  cursos: Curso[] = [];
  matriculasByCursoId = new Map<string, Matricula>();
  cursoSelecionado?: Curso;
  aulaSelecionada?: Aula;
  aulasSidebarTab: 'roteiro' | 'notas' = 'notas';

  activeVideoUrl?: string;
  videoLoading = false;
  videoLoadProgress = 0;
  private videoUrlCache = new Map<string, string>();
  private pendingSeekSeconds?: number;
  private lastSavedVideoSecond = -1;
  loadingCursos = false;
  estudosError = '';
  estudosStatus = '';

  // Quick Note attached to current video timestamp
  quickNoteTitle = '';
  quickNoteContent = '';
  quickNoteTagsInput = '';
  capturedTimestampSec?: number;
  savingQuickNote = false;

  // Notebook filter
  noteCursoFilter = '';

  // --- Pomodoro Timer ---
  pomodoroMinutes = 25;
  pomodoroSeconds = 0;
  isTimerRunning = false;
  timerInterval: any;
  pomodoroMode: 'study' | 'break' = 'study';
  completedPomodoros = 3;

  // --- Flashcards ---
  currentFlashcardIndex = 0;
  flashcardsLearned = 14;
  flashcards: Flashcard[] = [
    {
      id: 'fc-1',
      subject: 'Arquitetura de Software',
      front: 'O que define o padrão arquitetural Event-Driven?',
      back: 'Uma arquitetura baseada na produção, detecção e consumo de eventos desacoplados, permitindo que produtores e consumidores operem de forma assíncrona.',
      difficulty: 'médio',
      reviewsCount: 4,
      flipped: false
    },
    {
      id: 'fc-2',
      subject: 'Segurança & Criptografia',
      front: 'Qual a diferença entre chave simétrica e chave assimétrica?',
      back: 'Criptografia simétrica utiliza a mesma chave para cifrar e decifrar (ex: AES). Assimétrica usa um par de chaves pública e privada (ex: RSA, ECC).',
      difficulty: 'fácil',
      reviewsCount: 6,
      flipped: false
    },
    {
      id: 'fc-3',
      subject: 'Banco de Dados',
      front: 'O que garante a propriedade ACID em transações?',
      back: 'Atomicidade (tudo ou nada), Consistência (regras mantidas), Isolamento (transações concorrentes não interferem) e Durabilidade (dados persistem após commit).',
      difficulty: 'médio',
      reviewsCount: 5,
      flipped: false
    },
    {
      id: 'fc-4',
      subject: 'Frontend Angular',
      front: 'Para que serve a estratégia OnPush no ChangeDetection?',
      back: 'Informa ao Angular que o componente só deve ser verificado quando seus inputs mudarem por referência ou eventos disparados por ele mesmo, otimizando performance.',
      difficulty: 'difícil',
      reviewsCount: 3,
      flipped: false
    }
  ];

  // --- Grupos de Estudo ---
  groups: StudyGroup[] = [
    {
      id: 'grp-1',
      name: 'Grupo de Estudos Cloud & Kubernetes',
      subject: 'Infraestrutura',
      membersCount: 18,
      activeTopic: 'Operadores customizados e Ingress Controller com Traefik',
      meetingSchedule: 'Quartas-feiras às 19:30',
      isMember: true
    },
    {
      id: 'grp-2',
      name: 'Mesa Redonda: Engenharia de Prompt e LLMs',
      subject: 'Inteligência Artificial',
      membersCount: 24,
      activeTopic: 'RAG multimodal com banco de vetores Pgvector',
      meetingSchedule: 'Sextas-feiras às 16:00',
      isMember: true
    },
    {
      id: 'grp-3',
      name: 'Preparatório Certificação Segurança & LGPD',
      subject: 'Compliance',
      membersCount: 12,
      activeTopic: 'Simulado de incidentes de dados e Relatório RIPD',
      meetingSchedule: 'Segundas-feiras às 18:00',
      isMember: false
    }
  ];

  // --- Caderno de Notas ---
  notes: StudyNote[] = [];

  // Modals
  showNewCardModal = false;
  newCard: Partial<Flashcard> = {
    subject: 'Geral',
    front: '',
    back: '',
    difficulty: 'médio'
  };

  showNewNoteModal = false;
  newNote: Partial<StudyNote> = {
    title: '',
    subject: 'Geral',
    content: '',
    tags: []
  };
  noteTagInput = '';

  constructor(
    @Optional() private readonly cursoApi?: CursoService,
    @Optional() private readonly matriculaApi?: MatriculaService,
    @Optional() private readonly anotacaoApi?: AnotacaoEstudoService,
    @Optional() private readonly storageMediaApi?: StorageMediaService,
    @Optional() private readonly route?: ActivatedRoute,
    @Optional() private readonly router?: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.carregarTreinamentos(),
      this.carregarAnotacoes(),
    ]);

    const params = this.route?.snapshot?.queryParamMap;
    const cursoId = params?.get('cursoId');
    const aulaId = params?.get('aulaId');
    const tParam = params?.get('t');

    if (cursoId) {
      this.activeTab = 'aulas';
      const targetCurso = this.cursos.find(c => c.internalId === cursoId);
      if (targetCurso) {
        const seekSec = tParam ? Number(tParam) : undefined;
        await this.selecionarCurso(targetCurso, aulaId || undefined, Number.isFinite(seekSec) ? seekSec : undefined);
      }
    } else if (this.cursos.length > 0 && !this.cursoSelecionado) {
      await this.selecionarCurso(this.cursos[0]);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.salvarTempoVideo(true);
  }

  // --- Integração Treinamento -> Estudos ---
  async carregarTreinamentos(): Promise<void> {
    if (!this.cursoApi) return;
    this.loadingCursos = true;
    try {
      const res = await lastValueFrom(this.cursoApi.getCatalogo({ body: {} }));
      this.cursos = res.cursos || [];
      this.matriculasByCursoId.clear();
      for (const m of res.matriculas || []) {
        if (m.cursoId) {
          this.matriculasByCursoId.set(m.cursoId, m);
        }
      }
    } catch (err: any) {
      this.estudosError = err?.error?.message || 'Não foi possível carregar os treinamentos disponíveis.';
    } finally {
      this.loadingCursos = false;
    }
  }

  async carregarAnotacoes(): Promise<void> {
    if (!this.anotacaoApi) {
      this.notes = [
        {
          id: 'n-1',
          title: 'Resumo sobre Design Patterns Comportamentais',
          subject: 'Engenharia de Software',
          content: 'Observer: desacopla o sujeito dos observadores. Strategy: encapsula famílias de algoritmos para serem intercambiáveis.',
          updatedAt: '20/10/2026',
          tags: ['Design Patterns', 'Arquitetura', 'GoF']
        }
      ];
      return;
    }
    try {
      const list = await lastValueFrom(this.anotacaoApi.getList({ body: {} }));
      this.notes = (list || []).map(a => this.mapAnotacaoToUi(a));
    } catch {
      // mantém lista atual
    }
  }

  private mapAnotacaoToUi(a: AnotacaoEstudo): StudyNote {
    return {
      id: a.internalId || `n-${Date.now()}`,
      title: a.titulo || 'Anotação',
      subject: a.disciplina || a.cursoTitulo || 'Geral',
      content: a.conteudo || '',
      updatedAt: a.createdAt ? new Date(a.createdAt as any).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      tags: Array.isArray(a.tags) ? a.tags : [],
      cursoId: a.cursoId,
      cursoTitulo: a.cursoTitulo,
      aulaId: a.aulaId,
      aulaTitulo: a.aulaTitulo,
      timestampSegundos: a.timestampSegundos,
      timestampLabel: a.timestampLabel,
      raw: a,
    };
  }

  getAulasDoCurso(curso?: Curso): Aula[] {
    if (!curso?.aulas) return [];
    return [...curso.aulas].sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0));
  }

  getProgressoCurso(curso?: Curso): number {
    if (!curso?.internalId) return 0;
    return Number(this.matriculasByCursoId.get(curso.internalId)?.progresso || 0);
  }

  isAulaConcluida(aula?: Aula): boolean {
    if (!this.cursoSelecionado?.internalId || !aula?.internalId) return false;
    const mat = this.matriculasByCursoId.get(this.cursoSelecionado.internalId);
    return Boolean(mat?.aulasConcluidasIds?.includes(aula.internalId));
  }

  get notasDaAulaAtual(): StudyNote[] {
    if (!this.aulaSelecionada?.internalId) {
      return this.cursoSelecionado?.internalId
        ? this.notes.filter(n => n.cursoId === this.cursoSelecionado?.internalId)
        : [];
    }
    return this.notes.filter(n => n.aulaId === this.aulaSelecionada?.internalId);
  }

  get filteredNotebookNotes(): StudyNote[] {
    if (!this.noteCursoFilter) return this.notes;
    return this.notes.filter(n => n.cursoId === this.noteCursoFilter);
  }

  async selecionarCurso(curso: Curso, aulaId?: string, seekSeconds?: number): Promise<void> {
    this.salvarTempoVideo(true);
    this.cursoSelecionado = curso;

    if (this.matriculaApi && curso.internalId && !this.matriculasByCursoId.has(curso.internalId)) {
      try {
        const mat = await lastValueFrom(this.matriculaApi.matricular({ body: { cursoId: curso.internalId } }));
        if (mat) this.matriculasByCursoId.set(curso.internalId, mat);
      } catch {
        // segue mesmo sem matrícula prévia
      }
    }

    const aulas = this.getAulasDoCurso(curso);
    const mat = curso.internalId ? this.matriculasByCursoId.get(curso.internalId) : undefined;
    const targetAula =
      (aulaId ? aulas.find(a => a.internalId === aulaId) : undefined) ||
      (mat?.ultimaAulaId ? aulas.find(a => a.internalId === mat.ultimaAulaId) : undefined) ||
      aulas[0];

    await this.selecionarAula(targetAula, seekSeconds);
  }

  async selecionarAula(aula?: Aula, seekSeconds?: number): Promise<void> {
    this.salvarTempoVideo(true);
    this.aulaSelecionada = aula;
    this.activeVideoUrl = undefined;
    this.videoLoadProgress = 0;
    this.lastSavedVideoSecond = -1;
    this.capturedTimestampSec = seekSeconds;
    this.pendingSeekSeconds = seekSeconds;

    if (!aula?.videoAssetId || !this.storageMediaApi) return;

    this.videoLoading = true;
    try {
      const url = await this.carregarVideoUrlStorage(aula.videoAssetId);
      if (this.aulaSelecionada?.internalId === aula.internalId) {
        this.activeVideoUrl = url;
      }
    } catch (err: any) {
      this.estudosError = err?.message || 'Erro ao carregar vídeo da aula no Storage.';
    } finally {
      this.videoLoading = false;
    }
  }

  private async carregarVideoUrlStorage(assetId: string): Promise<string> {
    if (this.videoUrlCache.has(assetId)) {
      this.videoLoadProgress = 100;
      return this.videoUrlCache.get(assetId)!;
    }
    const info = await lastValueFrom(this.storageMediaApi!.getAssetInfo({ body: { assetId } }));
    const totalBytes = Number(info.sizeBytes || 0);
    const mimeType = info.mimeType || 'video/mp4';
    const parts: BlobPart[] = [];

    if (totalBytes > 0) {
      const chunkBytes = 1536 * 1024;
      let offset = 0;
      while (offset < totalBytes) {
        const res = await lastValueFrom(
          this.storageMediaApi!.readChunk({
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
        this.videoLoadProgress = Math.min(100, Math.round((offset / totalBytes) * 100));
        if (bytes.length === 0) break;
      }
    }

    const blob = new Blob(parts, { type: mimeType });
    const url = URL.createObjectURL(blob);
    this.videoUrlCache.set(assetId, url);
    this.videoLoadProgress = 100;
    return url;
  }

  onEstudosVideoLoadedMetadata(): void {
    const video = this.estudosVideoRef?.nativeElement;
    if (!video || !this.cursoSelecionado?.internalId || !this.aulaSelecionada?.internalId) return;
    let targetSec = this.pendingSeekSeconds;
    this.pendingSeekSeconds = undefined;
    if (targetSec === undefined) {
      const mat = this.matriculasByCursoId.get(this.cursoSelecionado.internalId);
      const map = (mat?.ultimoTempoPorAula || {}) as Record<string, number>;
      targetSec = Number(map[this.aulaSelecionada.internalId] || 0);
    }
    if (targetSec && targetSec > 1 && targetSec < (video.duration || Infinity)) {
      video.currentTime = targetSec;
    }
  }

  onEstudosVideoTimeUpdate(): void {
    const video = this.estudosVideoRef?.nativeElement;
    if (!video) return;
    const sec = Math.floor(video.currentTime || 0);
    if (sec > 0 && Math.abs(sec - this.lastSavedVideoSecond) >= 12) {
      this.salvarTempoVideo(false);
    }
  }

  async onEstudosVideoEnded(): Promise<void> {
    if (this.aulaSelecionada && !this.isAulaConcluida(this.aulaSelecionada)) {
      await this.alternarConclusaoAula(this.aulaSelecionada);
    } else {
      await this.salvarTempoVideo(true);
    }
  }

  async salvarTempoVideo(force = false): Promise<void> {
    const video = this.estudosVideoRef?.nativeElement;
    if (!video || !this.matriculaApi || !this.cursoSelecionado?.internalId || !this.aulaSelecionada?.internalId) return;
    const sec = Math.floor(video.currentTime || 0);
    if (!force && Math.abs(sec - this.lastSavedVideoSecond) < 5) return;
    this.lastSavedVideoSecond = sec;
    try {
      const mat = await lastValueFrom(
        this.matriculaApi.registrarProgresso({
          body: {
            cursoId: this.cursoSelecionado.internalId,
            aulaId: this.aulaSelecionada.internalId,
            ultimoTempoSegundos: sec,
          }
        })
      );
      if (mat) this.matriculasByCursoId.set(this.cursoSelecionado.internalId, mat);
    } catch {
      // silencioso
    }
  }

  async alternarConclusaoAula(aula: Aula): Promise<void> {
    if (!this.matriculaApi || !this.cursoSelecionado?.internalId || !aula.internalId) return;
    const nextState = !this.isAulaConcluida(aula);
    const sec = Math.floor(this.estudosVideoRef?.nativeElement?.currentTime || 0);
    try {
      const mat = await lastValueFrom(
        this.matriculaApi.registrarProgresso({
          body: {
            cursoId: this.cursoSelecionado.internalId,
            aulaId: aula.internalId,
            concluida: nextState,
            ultimoTempoSegundos: sec,
          }
        })
      );
      if (mat) {
        this.matriculasByCursoId.set(this.cursoSelecionado.internalId, mat);
        if (mat.certificadoCodigo) {
          this.estudosStatus = `Parabéns! Curso concluído (100%) — Certificado emitido: ${mat.certificadoCodigo}`;
        }
      }
    } catch (err: any) {
      this.estudosError = err?.error?.message || 'Erro ao atualizar conclusão da aula.';
    }
  }

  capturarMinutagemAtual(): void {
    const video = this.estudosVideoRef?.nativeElement;
    const sec = Math.floor(video?.currentTime || 0);
    this.capturedTimestampSec = sec;
    this.aulasSidebarTab = 'notas';
    if (!this.quickNoteTitle && this.aulaSelecionada?.titulo) {
      this.quickNoteTitle = `${this.aulaSelecionada.titulo} (${this.formatSeconds(sec)})`;
    }
  }

  async salvarAnotacaoDaAula(): Promise<void> {
    if (!this.quickNoteContent.trim()) return;
    const videoSec = this.capturedTimestampSec !== undefined
      ? this.capturedTimestampSec
      : Math.floor(this.estudosVideoRef?.nativeElement?.currentTime || 0);
    const tsLabel = this.formatSeconds(videoSec);
    const title = this.quickNoteTitle.trim() || `Anotação em ${tsLabel}`;
    const tags = this.quickNoteTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload: AnotacaoEstudo = {
      titulo: title,
      disciplina: this.cursoSelecionado?.trilha || 'Treinamento',
      conteudo: this.quickNoteContent.trim(),
      tags: tags.length > 0 ? tags : ['Aula'],
      cursoId: this.cursoSelecionado?.internalId || undefined,
      cursoTitulo: this.cursoSelecionado?.titulo || undefined,
      aulaId: this.aulaSelecionada?.internalId || undefined,
      aulaTitulo: this.aulaSelecionada?.titulo || undefined,
      timestampSegundos: videoSec,
      timestampLabel: tsLabel,
    };

    this.savingQuickNote = true;
    try {
      if (this.anotacaoApi) {
        const saved = await lastValueFrom(this.anotacaoApi.sync({ body: { data: payload } }));
        this.notes.unshift(this.mapAnotacaoToUi(saved));
      } else {
        this.notes.unshift({
          id: `n-${Date.now()}`,
          title,
          subject: payload.disciplina || 'Treinamento',
          content: payload.conteudo || '',
          updatedAt: new Date().toLocaleDateString('pt-BR'),
          tags: payload.tags || [],
          cursoId: payload.cursoId,
          cursoTitulo: payload.cursoTitulo,
          aulaId: payload.aulaId,
          aulaTitulo: payload.aulaTitulo,
          timestampSegundos: videoSec,
          timestampLabel: tsLabel,
        });
      }
      this.quickNoteTitle = '';
      this.quickNoteContent = '';
      this.quickNoteTagsInput = '';
      this.capturedTimestampSec = undefined;
      this.estudosStatus = `Anotação salva em ${tsLabel}!`;
    } catch (err: any) {
      this.estudosError = err?.error?.message || 'Falha ao salvar anotação.';
    } finally {
      this.savingQuickNote = false;
    }
  }

  async irParaMinutagemNota(note: StudyNote): Promise<void> {
    const sec = Number(note.timestampSegundos || 0);
    if (note.cursoId && (!this.cursoSelecionado || this.cursoSelecionado.internalId !== note.cursoId || this.aulaSelecionada?.internalId !== note.aulaId)) {
      const targetCurso = this.cursos.find(c => c.internalId === note.cursoId);
      if (targetCurso) {
        this.activeTab = 'aulas';
        await this.selecionarCurso(targetCurso, note.aulaId || undefined, sec);
        return;
      }
    }

    this.activeTab = 'aulas';
    const video = this.estudosVideoRef?.nativeElement;
    if (video) {
      video.currentTime = sec;
      video.play().catch(() => { });
    }
  }

  async baixarMaterialApoio(mat: MaterialApoioItem): Promise<void> {
    if (!mat.assetId || !this.storageMediaApi) return;
    try {
      const info = await lastValueFrom(this.storageMediaApi.getAssetInfo({ body: { assetId: mat.assetId } }));
      const totalBytes = Number(info.sizeBytes || 0);
      const parts: BlobPart[] = [];
      let offset = 0;
      const chunkBytes = 1536 * 1024;
      while (offset < totalBytes) {
        const res = await lastValueFrom(
          this.storageMediaApi.readChunk({
            body: {
              assetId: mat.assetId,
              start: offset,
              end: Math.min(totalBytes - 1, offset + chunkBytes - 1),
            }
          })
        );
        const bytes = this.base64ToUint8Array(res.chunkBase64 || '');
        parts.push(bytes as unknown as BlobPart);
        offset = Number(res.end ?? offset) + 1;
        if (bytes.length === 0) break;
      }
      const blob = new Blob(parts, { type: mat.mimeType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mat.nome || info.originalFileName || 'material';
      a.click();
    } catch {
      this.estudosError = 'Não foi possível baixar o material de apoio.';
    }
  }

  abrirTreinamentoNoPortal(cursoId?: string | null): void {
    this.router?.navigate(['/Treinamento'], {
      queryParams: cursoId ? { cursoId } : undefined,
    });
  }

  formatSeconds(sec?: number | null): string {
    const s = Math.max(0, Math.floor(Number(sec || 0)));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }

  formatBytes(bytes?: number | null): string {
    const b = Number(bytes || 0);
    if (!b) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
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

  // --- Timer Controls ---
  toggleTimer(): void {
    if (this.isTimerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.pomodoroSeconds === 0) {
        if (this.pomodoroMinutes === 0) {
          this.switchTimerMode();
        } else {
          this.pomodoroMinutes--;
          this.pomodoroSeconds = 59;
        }
      } else {
        this.pomodoroSeconds--;
      }
    }, 1000);
  }

  pauseTimer(): void {
    this.isTimerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resetTimer(): void {
    this.pauseTimer();
    this.pomodoroMinutes = this.pomodoroMode === 'study' ? 25 : 5;
    this.pomodoroSeconds = 0;
  }

  switchTimerMode(): void {
    this.pauseTimer();
    if (this.pomodoroMode === 'study') {
      this.pomodoroMode = 'break';
      this.pomodoroMinutes = 5;
      this.completedPomodoros++;
    } else {
      this.pomodoroMode = 'study';
      this.pomodoroMinutes = 25;
    }
    this.pomodoroSeconds = 0;
  }

  formatTimer(): string {
    const min = this.pomodoroMinutes.toString().padStart(2, '0');
    const sec = this.pomodoroSeconds.toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  // --- Flashcard Operations ---
  flipCard(card: Flashcard): void {
    card.flipped = !card.flipped;
  }

  nextCard(): void {
    if (this.currentFlashcardIndex < this.flashcards.length - 1) {
      this.currentFlashcardIndex++;
    } else {
      this.currentFlashcardIndex = 0;
    }
    this.flashcards[this.currentFlashcardIndex].flipped = false;
  }

  prevCard(): void {
    if (this.currentFlashcardIndex > 0) {
      this.currentFlashcardIndex--;
    } else {
      this.currentFlashcardIndex = this.flashcards.length - 1;
    }
    this.flashcards[this.currentFlashcardIndex].flipped = false;
  }

  rateFlashcard(feedback: 'facil' | 'revisar' | 'dificil'): void {
    const card = this.flashcards[this.currentFlashcardIndex];
    card.reviewsCount++;
    if (feedback === 'facil') {
      this.flashcardsLearned++;
    }
    this.nextCard();
  }

  openNewCardModal(): void {
    this.newCard = { subject: 'Geral', front: '', back: '', difficulty: 'médio' };
    this.showNewCardModal = true;
  }

  saveNewCard(): void {
    if (!this.newCard.front || !this.newCard.back) return;
    this.flashcards.push({
      id: `fc-${Date.now()}`,
      subject: this.newCard.subject || 'Geral',
      front: this.newCard.front,
      back: this.newCard.back,
      difficulty: (this.newCard.difficulty as any) || 'médio',
      reviewsCount: 0,
      flipped: false
    });
    this.showNewCardModal = false;
  }

  // --- Study Group Operations ---
  toggleJoinGroup(grp: StudyGroup): void {
    grp.isMember = !grp.isMember;
    grp.membersCount += grp.isMember ? 1 : -1;
  }

  // --- Notes Operations ---
  openNewNoteModal(): void {
    this.newNote = { title: '', subject: this.cursoSelecionado?.trilha || 'Geral', content: '', tags: [] };
    this.noteTagInput = '';
    this.showNewNoteModal = true;
  }

  addTag(): void {
    if (this.noteTagInput.trim()) {
      if (!this.newNote.tags) this.newNote.tags = [];
      this.newNote.tags.push(this.noteTagInput.trim());
      this.noteTagInput = '';
    }
  }

  async saveNewNote(): Promise<void> {
    if (!this.newNote.title || !this.newNote.content) return;
    const payload: AnotacaoEstudo = {
      titulo: this.newNote.title,
      disciplina: this.newNote.subject || 'Geral',
      conteudo: this.newNote.content,
      tags: this.newNote.tags?.length ? this.newNote.tags : ['Anotação'],
      cursoId: this.cursoSelecionado?.internalId || undefined,
      cursoTitulo: this.cursoSelecionado?.titulo || undefined,
    };

    if (this.anotacaoApi) {
      try {
        const saved = await lastValueFrom(this.anotacaoApi.sync({ body: { data: payload } }));
        this.notes.unshift(this.mapAnotacaoToUi(saved));
        this.showNewNoteModal = false;
        return;
      } catch {
        // fallback local
      }
    }

    this.notes.unshift({
      id: `n-${Date.now()}`,
      title: this.newNote.title,
      subject: this.newNote.subject || 'Geral',
      content: this.newNote.content,
      updatedAt: new Date().toLocaleDateString('pt-BR'),
      tags: this.newNote.tags || ['Anotação']
    });
    this.showNewNoteModal = false;
  }

  async deleteNote(note: StudyNote): Promise<void> {
    if (this.anotacaoApi && note.raw) {
      try {
        await lastValueFrom(this.anotacaoApi.delete({ body: note.raw }));
      } catch {
        // segue remoção visual
      }
    }
    this.notes = this.notes.filter(n => n.id !== note.id);
  }
}
