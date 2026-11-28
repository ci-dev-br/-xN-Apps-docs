import { Component, ElementRef, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Aula, Curso, Instrutor, MaterialApoioItem, Matricula, Turma } from '@ci/portal-api';
import { TreinamentoService } from '../../treinamento.service';

export interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  duration: string;
  durationSeconds?: number;
  ordem?: number;
  completed: boolean;
  videoAssetId?: string | null;
  videoFileName?: string | null;
  thumbnailDataUrl?: string | null;
  videoMetadata?: any;
  materiaisApoio: MaterialApoioItem[];
  raw?: Aula;
}

export interface TrainingCourse {
  id: string;
  title: string;
  track: string;
  instructor: string;
  hours: number;
  lessonsCount: number;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  rating: number;
  progress: number;
  thumbnailColor: string;
  posterDataUrl?: string;
  icon: string;
  description: string;
  ementa?: string;
  precoBase?: number;
  publicado?: boolean;
  isOwner?: boolean;
  lessons: CourseLesson[];
  turmas: Turma[];
  raw?: Curso;
}

export interface TrainingCertificate {
  id: string;
  courseTitle: string;
  studentName: string;
  issuedAt: string;
  code: string;
  hours: number;
}

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('lessonVideoRef') lessonVideoRef?: ElementRef<HTMLVideoElement>;

  activeView: 'catalog' | 'instrutor' = 'catalog';
  isLoading = false;
  statusMessage = '';
  errorMessage = '';

  selectedTrack = 'Todos';
  searchQuery = '';

  tracks = [
    'Todos',
    'Segurança & Compliance',
    'Liderança & Gestão',
    'Tecnologia & Dev',
    'Processos & Onboarding'
  ];

  courses: TrainingCourse[] = [];
  instructorCourses: TrainingCourse[] = [];
  matriculasByCursoId = new Map<string, Matricula>();
  certificates: TrainingCertificate[] = [];

  // Active Lesson / Player Modal
  activeCourse?: TrainingCourse;
  activeLesson?: CourseLesson;
  showCoursePlayerModal = false;
  activeVideoUrl?: string;
  videoLoading = false;
  videoLoadProgress = 0;
  private lastSavedSecond = -1;

  // Active Certificate Modal
  selectedCertificate?: TrainingCertificate;
  showCertModal = false;

  // New Course Modal
  showNewCourseModal = false;
  newCourse: Partial<TrainingCourse> = {
    title: '',
    track: 'Tecnologia & Dev',
    instructor: '',
    hours: 8,
    level: 'Iniciante',
    description: '',
    ementa: '',
    precoBase: 0,
    icon: 'school',
    thumbnailColor: '#2563eb',
    publicado: true,
  };

  // Instructor Panel State
  instrutorPerfil: Instrutor = {};
  savingInstrutor = false;
  selectedInstructorCourse?: TrainingCourse;
  editingCourseForm: Partial<Curso> = {};
  savingCourse = false;

  // New Lesson Form (Instructor Panel)
  newLessonTitle = '';
  newLessonDescription = '';
  creatingLesson = false;

  // Upload tracking per lesson
  uploadingVideoLessonId?: string;
  videoUploadProgress = 0;
  videoUploadStage = '';

  uploadingMaterialLessonId?: string;
  materialUploadProgress = 0;
  materialUploadStage = '';
  materialDescriptionByLesson: Record<string, string> = {};

  // New Turma Form
  newTurma: Partial<Turma> = {
    nome: '',
    localOuLink: '',
    vagasDisponiveis: 30,
    status: 'Aberta',
  };
  newTurmaInicioStr = '';
  newTurmaFimStr = '';
  savingTurma = false;

  constructor(
    @Optional() private readonly treinamentoService?: TreinamentoService,
    @Optional() private readonly route?: ActivatedRoute,
    @Optional() private readonly router?: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    const routeMode = this.route?.snapshot?.data?.['mode'];
    if (routeMode === 'instrutor') {
      this.activeView = 'instrutor';
    }
    await this.carregarDados();

    const queryCursoId = this.route?.snapshot?.queryParamMap?.get('cursoId');
    if (queryCursoId) {
      const target = this.courses.find(c => c.id === queryCursoId);
      if (target) {
        await this.openCourse(target);
      }
    }
  }

  ngOnDestroy(): void {
    this.salvarTempoAtualDoVideo(true);
  }

  async switchView(view: 'catalog' | 'instrutor'): Promise<void> {
    this.activeView = view;
    this.errorMessage = '';
    this.statusMessage = '';
    if (view === 'instrutor') {
      await this.carregarPainelInstrutor();
    } else {
      await this.carregarDados();
    }
  }

  async carregarDados(): Promise<void> {
    if (!this.treinamentoService?.hasApi) return;
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const [catalogo, perfil] = await Promise.all([
        this.treinamentoService.getCatalogo({}),
        this.treinamentoService.getMeuPerfilInstrutor().catch(() => undefined),
      ]);
      if (perfil) {
        this.instrutorPerfil = perfil;
      }

      this.matriculasByCursoId.clear();
      const certs: TrainingCertificate[] = [];

      for (const m of catalogo.matriculas || []) {
        if (m.cursoId) {
          this.matriculasByCursoId.set(m.cursoId, m);
        }
        if (m.certificadoCodigo) {
          const courseMatch = (catalogo.cursos || []).find(c => c.internalId === m.cursoId);
          certs.push({
            id: m.internalId || m.certificadoCodigo,
            courseTitle: courseMatch?.titulo || 'Treinamento Corporativo',
            studentName: m.alunoNome || 'Colaborador Autorizado',
            issuedAt: m.certificadoEmitidoEm || new Date().toLocaleDateString('pt-BR'),
            code: m.certificadoCodigo,
            hours: Number(courseMatch?.cargaHoraria || 1),
          });
        }
      }
      this.certificates = certs;
      this.courses = (catalogo.cursos || []).map(c => this.mapCursoToUi(c));

      if (this.activeView === 'instrutor') {
        await this.carregarPainelInstrutor();
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Não foi possível carregar os treinamentos.';
    } finally {
      this.isLoading = false;
    }
  }

  async carregarPainelInstrutor(): Promise<void> {
    if (!this.treinamentoService?.hasApi) return;
    try {
      const [perfil, meus] = await Promise.all([
        this.treinamentoService.getMeuPerfilInstrutor(),
        this.treinamentoService.getCatalogo({ apenasMeusCursosInstrutor: true }),
      ]);
      if (perfil) this.instrutorPerfil = perfil;
      this.instructorCourses = (meus.cursos || []).map(c => this.mapCursoToUi(c, true));

      if (this.selectedInstructorCourse) {
        const refreshed = this.instructorCourses.find(c => c.id === this.selectedInstructorCourse?.id);
        if (refreshed) {
          this.selectInstructorCourse(refreshed);
        } else {
          this.selectedInstructorCourse = this.instructorCourses[0];
          if (this.selectedInstructorCourse) this.selectInstructorCourse(this.selectedInstructorCourse);
        }
      } else if (this.instructorCourses.length > 0) {
        this.selectInstructorCourse(this.instructorCourses[0]);
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Erro ao carregar painel do instrutor.';
    }
  }

  private mapCursoToUi(c: Curso, forceOwner = false): TrainingCourse {
    const mat = c.internalId ? this.matriculasByCursoId.get(c.internalId) : undefined;
    const completedIds = new Set<string>(mat?.aulasConcluidasIds || []);
    const aulasSorted = [...(c.aulas || [])].sort((a, b) => (Number(a.ordem || 0) - Number(b.ordem || 0)));

    const lessons: CourseLesson[] = aulasSorted.map(a => ({
      id: a.internalId || '',
      title: a.titulo || 'Aula sem título',
      description: a.descricao || undefined,
      duration: a.duracaoLabel || '00:00',
      durationSeconds: Number(a.duracaoSegundos || 0),
      ordem: Number(a.ordem || 1),
      completed: Boolean(a.internalId && completedIds.has(a.internalId)),
      videoAssetId: a.videoAssetId,
      videoFileName: a.videoFileName,
      thumbnailDataUrl: a.thumbnailDataUrl,
      videoMetadata: a.videoMetadata,
      materiaisApoio: Array.isArray(a.materiaisApoio) ? a.materiaisApoio : [],
      raw: a,
    }));

    const firstPoster = lessons.find(l => l.thumbnailDataUrl)?.thumbnailDataUrl || undefined;
    return {
      id: c.internalId || '',
      title: c.titulo || 'Treinamento sem título',
      track: c.trilha || 'Tecnologia & Dev',
      instructor: c.instrutorNome || c.instrutor?.nome || 'Instrutor',
      hours: Number(c.cargaHoraria || 1),
      lessonsCount: lessons.length,
      level: ((c.nivel as any) || 'Iniciante'),
      rating: Number(c.rating || 5.0),
      progress: Number(mat?.progresso || 0),
      thumbnailColor: c.corCapa || '#2563eb',
      posterDataUrl: firstPoster,
      icon: c.icone || 'school',
      description: c.descricao || '',
      ementa: c.ementa || '',
      precoBase: Number(c.precoBase || 0),
      publicado: c.publicado !== false,
      isOwner: forceOwner || Boolean(this.instrutorPerfil?.userId && c.instrutorUserId === this.instrutorPerfil.userId),
      lessons,
      turmas: c.turmas || [],
      raw: c,
    };
  }

  get filteredCourses(): TrainingCourse[] {
    return this.courses.filter(c => {
      const matchTrack = this.selectedTrack === 'Todos' || c.track === this.selectedTrack;
      const matchSearch = !this.searchQuery ||
        c.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchTrack && matchSearch;
    });
  }

  get completedCoursesCount(): number {
    return this.courses.filter(c => c.progress === 100).length;
  }

  get totalHoursCompleted(): number {
    return this.courses
      .filter(c => c.progress === 100)
      .reduce((sum, c) => sum + c.hours, 0);
  }

  async openCourse(course: TrainingCourse): Promise<void> {
    this.activeCourse = course;
    this.showCoursePlayerModal = true;
    this.activeVideoUrl = undefined;

    if (this.treinamentoService?.hasApi && course.id && !this.matriculasByCursoId.has(course.id)) {
      try {
        const mat = await this.treinamentoService.matricular(course.id);
        if (mat) this.matriculasByCursoId.set(course.id, mat);
      } catch {
        // Ignora erro caso apenas visualização
      }
    }

    const matricula = this.matriculasByCursoId.get(course.id);
    const preferredLesson = matricula?.ultimaAulaId
      ? course.lessons.find(l => l.id === matricula.ultimaAulaId)
      : undefined;
    await this.selectLesson(preferredLesson || course.lessons[0]);
  }

  closeCoursePlayer(): void {
    this.salvarTempoAtualDoVideo(true);
    this.showCoursePlayerModal = false;
    this.activeVideoUrl = undefined;
  }

  async selectLesson(lesson?: CourseLesson): Promise<void> {
    if (!lesson) {
      this.activeLesson = undefined;
      this.activeVideoUrl = undefined;
      return;
    }
    this.salvarTempoAtualDoVideo(true);
    this.activeLesson = lesson;
    this.activeVideoUrl = undefined;
    this.videoLoadProgress = 0;
    this.lastSavedSecond = -1;

    if (lesson.videoAssetId && this.treinamentoService?.hasApi) {
      this.videoLoading = true;
      try {
        const media = await this.treinamentoService.carregarMidiaBlobUrl(
          lesson.videoAssetId,
          pct => { this.videoLoadProgress = pct; }
        );
        if (this.activeLesson?.id === lesson.id) {
          this.activeVideoUrl = media.url;
        }
      } catch (err: any) {
        this.errorMessage = err?.message || 'Não foi possível carregar o vídeo da aula.';
      } finally {
        this.videoLoading = false;
      }
    }
  }

  onVideoLoadedMetadata(): void {
    const video = this.lessonVideoRef?.nativeElement;
    if (!video || !this.activeCourse || !this.activeLesson) return;
    const mat = this.matriculasByCursoId.get(this.activeCourse.id);
    const savedMap = (mat?.ultimoTempoPorAula || {}) as Record<string, number>;
    const savedTime = Number(savedMap[this.activeLesson.id] || 0);
    if (savedTime > 2 && savedTime < (video.duration || Infinity)) {
      video.currentTime = savedTime;
    }
  }

  onVideoTimeUpdate(): void {
    const video = this.lessonVideoRef?.nativeElement;
    if (!video) return;
    const sec = Math.floor(video.currentTime || 0);
    if (sec > 0 && Math.abs(sec - this.lastSavedSecond) >= 12) {
      this.salvarTempoAtualDoVideo(false);
    }
  }

  async onVideoEnded(): Promise<void> {
    if (this.activeLesson && !this.activeLesson.completed) {
      await this.toggleLessonComplete(this.activeLesson);
    } else {
      await this.salvarTempoAtualDoVideo(true);
    }
  }

  async salvarTempoAtualDoVideo(force = false): Promise<void> {
    const video = this.lessonVideoRef?.nativeElement;
    if (!video || !this.activeCourse?.id || !this.activeLesson?.id || !this.treinamentoService?.hasApi) return;
    const sec = Math.floor(video.currentTime || 0);
    if (!force && Math.abs(sec - this.lastSavedSecond) < 5) return;
    this.lastSavedSecond = sec;
    try {
      const mat = await this.treinamentoService.registrarProgresso(
        this.activeCourse.id,
        this.activeLesson.id,
        undefined,
        sec,
      );
      if (mat) {
        this.matriculasByCursoId.set(this.activeCourse.id, mat);
      }
    } catch {
      // Silencioso para não interromper reprodução
    }
  }

  async toggleLessonComplete(lesson: CourseLesson): Promise<void> {
    lesson.completed = !lesson.completed;
    if (!this.activeCourse) return;

    const total = Math.max(1, this.activeCourse.lessons.length);
    const done = this.activeCourse.lessons.filter(l => l.completed).length;
    this.activeCourse.progress = Math.round((done / total) * 100);

    if (this.treinamentoService?.hasApi && this.activeCourse.id && lesson.id) {
      try {
        const videoSec = Math.floor(this.lessonVideoRef?.nativeElement?.currentTime || 0);
        const mat = await this.treinamentoService.registrarProgresso(
          this.activeCourse.id,
          lesson.id,
          lesson.completed,
          videoSec,
        );
        if (mat) {
          this.matriculasByCursoId.set(this.activeCourse.id, mat);
          this.activeCourse.progress = Number(mat.progresso || 0);
          if (mat.certificadoCodigo) {
            const exists = this.certificates.some(c => c.code === mat.certificadoCodigo);
            if (!exists) {
              this.certificates.unshift({
                id: mat.internalId || mat.certificadoCodigo,
                courseTitle: this.activeCourse.title,
                studentName: mat.alunoNome || 'Colaborador Autorizado',
                issuedAt: mat.certificadoEmitidoEm || new Date().toLocaleDateString('pt-BR'),
                code: mat.certificadoCodigo,
                hours: this.activeCourse.hours,
              });
            }
          }
        }
      } catch (err: any) {
        this.errorMessage = err?.error?.message || 'Erro ao salvar progresso da aula.';
      }
    }
  }

  async abrirNosEstudos(course: TrainingCourse, lesson?: CourseLesson): Promise<void> {
    if (this.treinamentoService?.hasApi && course.id && !this.matriculasByCursoId.has(course.id)) {
      try {
        const mat = await this.treinamentoService.matricular(course.id);
        if (mat) this.matriculasByCursoId.set(course.id, mat);
      } catch {
        // segue navegação
      }
    }
    const targetLesson = lesson || course.lessons[0];
    const currentSec = Math.floor(this.lessonVideoRef?.nativeElement?.currentTime || 0);
    this.closeCoursePlayer();
    this.router?.navigate(['/Estudos'], {
      queryParams: {
        cursoId: course.id,
        ...(targetLesson?.id ? { aulaId: targetLesson.id } : {}),
        ...(currentSec > 0 ? { t: currentSec } : {}),
      }
    });
  }

  async baixarMaterialApoio(mat: MaterialApoioItem): Promise<void> {
    if (!mat.assetId || !this.treinamentoService?.hasApi) return;
    try {
      await this.treinamentoService.baixarMaterial(mat.assetId, mat.nome || undefined);
    } catch (err: any) {
      this.errorMessage = err?.message || 'Erro ao baixar material de apoio.';
    }
  }

  viewCertificate(cert: TrainingCertificate): void {
    this.selectedCertificate = cert;
    this.showCertModal = true;
  }

  printCertificate(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  openCreateCourseModal(): void {
    this.newCourse = {
      title: '',
      track: 'Tecnologia & Dev',
      instructor: this.instrutorPerfil?.nome || '',
      hours: 8,
      level: 'Intermediário',
      description: '',
      ementa: '',
      precoBase: 0,
      icon: 'school',
      thumbnailColor: '#2563eb',
      publicado: true,
    };
    this.showNewCourseModal = true;
  }

  async saveNewCourse(): Promise<void> {
    if (!this.newCourse.title || !this.newCourse.instructor) return;

    if (this.treinamentoService?.hasApi) {
      this.savingCourse = true;
      try {
        const created = await this.treinamentoService.salvarCurso({
          titulo: this.newCourse.title,
          trilha: this.newCourse.track || 'Tecnologia & Dev',
          instrutorNome: this.newCourse.instructor,
          cargaHoraria: Number(this.newCourse.hours) || 8,
          precoBase: Number(this.newCourse.precoBase || 0),
          nivel: this.newCourse.level || 'Iniciante',
          descricao: this.newCourse.description || '',
          ementa: this.newCourse.ementa || '',
          icone: this.newCourse.icon || 'school',
          corCapa: this.newCourse.thumbnailColor || '#2563eb',
          publicado: this.newCourse.publicado !== false,
        });
        this.showNewCourseModal = false;
        this.statusMessage = `Treinamento "${created?.titulo}" criado! Agora adicione aulas com vídeo e material de apoio.`;
        await this.carregarDados();
        this.activeView = 'instrutor';
        await this.carregarPainelInstrutor();
        if (created?.internalId) {
          const found = this.instructorCourses.find(c => c.id === created.internalId);
          if (found) this.selectInstructorCourse(found);
        }
      } catch (err: any) {
        this.errorMessage = err?.error?.message || err?.message || 'Erro ao salvar treinamento.';
      } finally {
        this.savingCourse = false;
      }
      return;
    }

    const fallback: TrainingCourse = {
      id: `c-${Date.now()}`,
      title: this.newCourse.title,
      track: this.newCourse.track || 'Geral',
      instructor: this.newCourse.instructor,
      hours: Number(this.newCourse.hours) || 8,
      lessonsCount: 0,
      level: (this.newCourse.level as any) || 'Iniciante',
      rating: 5.0,
      progress: 0,
      thumbnailColor: this.newCourse.thumbnailColor || '#2563eb',
      icon: this.newCourse.icon || 'school',
      description: this.newCourse.description || '',
      lessons: [],
      turmas: [],
    };
    this.courses.unshift(fallback);
    this.showNewCourseModal = false;
  }

  // --- PAINEL DO INSTRUTOR ---
  async salvarPerfilInstrutor(): Promise<void> {
    if (!this.treinamentoService?.hasApi) return;
    this.savingInstrutor = true;
    try {
      const saved = await this.treinamentoService.salvarInstrutor(this.instrutorPerfil);
      if (saved) this.instrutorPerfil = saved;
      this.statusMessage = 'Perfil do instrutor atualizado com sucesso.';
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao salvar perfil do instrutor.';
    } finally {
      this.savingInstrutor = false;
    }
  }

  selectInstructorCourse(course: TrainingCourse): void {
    this.selectedInstructorCourse = course;
    this.editingCourseForm = {
      internalId: course.id,
      titulo: course.title,
      trilha: course.track,
      nivel: course.level,
      cargaHoraria: course.hours,
      precoBase: course.precoBase || 0,
      icone: course.icon,
      corCapa: course.thumbnailColor,
      descricao: course.description,
      ementa: course.ementa || '',
      instrutorNome: course.instructor,
      publicado: course.publicado !== false,
    };
  }

  async salvarEdicaoCurso(): Promise<void> {
    if (!this.treinamentoService?.hasApi || !this.editingCourseForm.internalId) return;
    this.savingCourse = true;
    try {
      await this.treinamentoService.salvarCurso(this.editingCourseForm as Curso);
      this.statusMessage = 'Dados do treinamento atualizados.';
      await this.carregarPainelInstrutor();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao atualizar treinamento.';
    } finally {
      this.savingCourse = false;
    }
  }

  async excluirCursoInstrutor(course: TrainingCourse): Promise<void> {
    if (!this.treinamentoService?.hasApi || !course.raw) return;
    try {
      await this.treinamentoService.excluirCurso(course.raw);
      if (this.selectedInstructorCourse?.id === course.id) {
        this.selectedInstructorCourse = undefined;
      }
      this.statusMessage = `Treinamento "${course.title}" removido.`;
      await this.carregarPainelInstrutor();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao excluir treinamento.';
    }
  }

  async adicionarAula(): Promise<void> {
    if (!this.treinamentoService?.hasApi || !this.selectedInstructorCourse?.id || !this.newLessonTitle.trim()) return;
    this.creatingLesson = true;
    try {
      await this.treinamentoService.salvarAula({
        cursoId: this.selectedInstructorCourse.id,
        titulo: this.newLessonTitle.trim(),
        descricao: this.newLessonDescription.trim(),
        ordem: this.selectedInstructorCourse.lessons.length + 1,
      });
      this.newLessonTitle = '';
      this.newLessonDescription = '';
      this.statusMessage = 'Aula adicionada! Faça o upload do vídeo (FFmpeg) e materiais de apoio abaixo.';
      await this.carregarPainelInstrutor();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao adicionar aula.';
    } finally {
      this.creatingLesson = false;
    }
  }

  async excluirAula(lesson: CourseLesson): Promise<void> {
    if (!this.treinamentoService?.hasApi || !lesson.raw) return;
    try {
      await this.treinamentoService.excluirAula(lesson.raw);
      await this.carregarPainelInstrutor();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao excluir aula.';
    }
  }

  async onVideoSelected(event: Event, lesson: CourseLesson): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !this.treinamentoService?.hasApi || !lesson.id) return;

    this.uploadingVideoLessonId = lesson.id;
    this.videoUploadProgress = 0;
    this.videoUploadStage = 'Preparando envio...';
    this.errorMessage = '';

    try {
      const asset = await this.treinamentoService.uploadArquivoStorage(file, 'video', {
        referenciaModulo: 'Treinamento',
        referenciaId: lesson.id,
        transcodeVideo: true,
        onProgress: (pct, stage) => {
          this.videoUploadProgress = pct;
          this.videoUploadStage = stage;
        },
      });
      if (asset?.internalId) {
        await this.treinamentoService.anexarVideoAula(lesson.id, asset.internalId);
        this.statusMessage = `Vídeo "${file.name}" processado com FFmpeg (${asset.durationLabel || '00:00'}) e salvo no Storage!`;
        await this.carregarPainelInstrutor();
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Falha ao enviar/processar vídeo com FFmpeg.';
    } finally {
      this.uploadingVideoLessonId = undefined;
      this.videoUploadProgress = 0;
      this.videoUploadStage = '';
      if (input) input.value = '';
    }
  }

  async onMaterialSelected(event: Event, lesson: CourseLesson): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !this.treinamentoService?.hasApi || !lesson.id) return;

    this.uploadingMaterialLessonId = lesson.id;
    this.materialUploadProgress = 0;
    this.materialUploadStage = 'Enviando material de apoio...';
    this.errorMessage = '';

    try {
      const asset = await this.treinamentoService.uploadArquivoStorage(file, 'material', {
        referenciaModulo: 'Treinamento',
        referenciaId: lesson.id,
        transcodeVideo: false,
        onProgress: (pct, stage) => {
          this.materialUploadProgress = pct;
          this.materialUploadStage = stage;
        },
      });
      if (asset?.internalId) {
        const desc = (this.materialDescriptionByLesson[lesson.id] || '').trim() || undefined;
        await this.treinamentoService.anexarMaterialAula(lesson.id, asset.internalId, desc);
        this.materialDescriptionByLesson[lesson.id] = '';
        this.statusMessage = `Material "${file.name}" anexado à aula "${lesson.title}".`;
        await this.carregarPainelInstrutor();
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Falha ao enviar material de apoio.';
    } finally {
      this.uploadingMaterialLessonId = undefined;
      this.materialUploadProgress = 0;
      this.materialUploadStage = '';
      if (input) input.value = '';
    }
  }

  async removerMaterial(lesson: CourseLesson, assetId?: string | null): Promise<void> {
    if (!this.treinamentoService?.hasApi || !lesson.id || !assetId) return;
    try {
      await this.treinamentoService.removerMaterialAula(lesson.id, assetId);
      await this.carregarPainelInstrutor();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao remover material de apoio.';
    }
  }

  async adicionarTurma(): Promise<void> {
    if (!this.treinamentoService?.hasApi || !this.selectedInstructorCourse?.id || !this.newTurma.nome) return;
    this.savingTurma = true;
    try {
      await this.treinamentoService.salvarTurma({
        cursoId: this.selectedInstructorCourse.id,
        nome: this.newTurma.nome,
        localOuLink: this.newTurma.localOuLink || 'Online (Ao Vivo / Gravado)',
        vagasDisponiveis: Number(this.newTurma.vagasDisponiveis || 30),
        status: this.newTurma.status || 'Aberta',
        dataInicio: this.newTurmaInicioStr ? new Date(this.newTurmaInicioStr) : undefined,
        dataFim: this.newTurmaFimStr ? new Date(this.newTurmaFimStr) : undefined,
      });
      this.newTurma = { nome: '', localOuLink: '', vagasDisponiveis: 30, status: 'Aberta' };
      this.newTurmaInicioStr = '';
      this.newTurmaFimStr = '';
      this.statusMessage = 'Turma agendada com sucesso!';
      await this.carregarPainelInstrutor();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao criar turma.';
    } finally {
      this.savingTurma = false;
    }
  }

  async excluirTurma(turma: Turma): Promise<void> {
    if (!this.treinamentoService?.hasApi) return;
    try {
      await this.treinamentoService.excluirTurma(turma);
      await this.carregarPainelInstrutor();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erro ao remover turma.';
    }
  }

  formatBytes(bytes?: number | null): string {
    const b = Number(bytes || 0);
    if (!b) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  }
}
