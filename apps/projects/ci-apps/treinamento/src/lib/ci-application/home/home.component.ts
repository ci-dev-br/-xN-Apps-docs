import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
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
  icon: string;
  description: string;
  lessons: CourseLesson[];
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
export class HomeComponent implements OnInit {
  selectedTrack = 'Todos';
  searchQuery = '';

  tracks = [
    'Todos',
    'Segurança & Compliance',
    'Liderança & Gestão',
    'Tecnologia & Dev',
    'Processos & Onboarding'
  ];

  courses: TrainingCourse[] = [
    {
      id: 'c-1',
      title: 'Segurança da Informação e LGPD na Prática Corporativa',
      track: 'Segurança & Compliance',
      instructor: 'Dra. Camila Menezes',
      hours: 12,
      lessonsCount: 6,
      level: 'Iniciante',
      rating: 4.9,
      progress: 100,
      thumbnailColor: '#1e40af',
      icon: 'security',
      description: 'Fundamentos essenciais de privacidade de dados, autenticação de dois fatores, engenharia social e conformidade LGPD.',
      lessons: [
        { id: 'l1', title: 'Introdução aos Princípios da LGPD', duration: '20m', completed: true },
        { id: 'l2', title: 'Tratamento de Dados e Consentimento', duration: '35m', completed: true },
        { id: 'l3', title: 'Boas Práticas de Senhas e 2FA', duration: '25m', completed: true },
        { id: 'l4', title: 'Identificando Tentativas de Phishing', duration: '40m', completed: true },
        { id: 'l5', title: 'Incidentes de Segurança e Protocolo de Resposta', duration: '30m', completed: true },
        { id: 'l6', title: 'Avaliação Final de Certificação', duration: '15m', completed: true }
      ]
    },
    {
      id: 'c-2',
      title: 'Arquitetura de Software Moderna e Microsserviços em Nuvem',
      track: 'Tecnologia & Dev',
      instructor: 'Eng. Fernando Rocha',
      hours: 24,
      lessonsCount: 8,
      level: 'Avançado',
      rating: 4.8,
      progress: 62,
      thumbnailColor: '#047857',
      icon: 'cloud_sync',
      description: 'Padrões de microsserviços, mensageria assíncrona, Docker, Kubernetes e resiliência com Circuit Breaker.',
      lessons: [
        { id: 'l2-1', title: 'Monólitos vs Microsserviços: Quando Decompor', duration: '45m', completed: true },
        { id: 'l2-2', title: 'Comunicação Assíncrona com RabbitMQ e Kafka', duration: '50m', completed: true },
        { id: 'l2-3', title: 'Isolamento de Banco e Transações Distribuídas (Saga)', duration: '60m', completed: true },
        { id: 'l2-4', title: 'Observabilidade com OpenTelemetry e Grafana', duration: '40m', completed: false },
        { id: 'l2-5', title: 'Deploy Automatizado e Zero Downtime', duration: '45m', completed: false }
      ]
    },
    {
      id: 'c-3',
      title: 'Liderança Eficaz, Gestão Ágil e Feedback Contínuo',
      track: 'Liderança & Gestão',
      instructor: 'Carla Vasconcellos',
      hours: 16,
      lessonsCount: 5,
      level: 'Intermediário',
      rating: 5.0,
      progress: 40,
      thumbnailColor: '#7c3aed',
      icon: 'psychology',
      description: 'Ferramentas de comunicação não-violenta, condução de reuniões 1-on-1, delegação estratégica e OKRs.',
      lessons: [
        { id: 'l3-1', title: 'O Papel do Líder Facilitador', duration: '30m', completed: true },
        { id: 'l3-2', title: 'Técnicas de 1-on-1 de Alto Impacto', duration: '40m', completed: true },
        { id: 'l3-3', title: 'Cultura de Feedback e Segurança Psicológica', duration: '45m', completed: false },
        { id: 'l3-4', title: 'Definindo Metas com OKRs Corporativos', duration: '35m', completed: false }
      ]
    },
    {
      id: 'c-4',
      title: 'Integração de Novos Colaboradores (Onboarding Geral)',
      track: 'Processos & Onboarding',
      instructor: 'Equipe de RH & Pessoas',
      hours: 8,
      lessonsCount: 4,
      level: 'Iniciante',
      rating: 4.7,
      progress: 100,
      thumbnailColor: '#ea580c',
      icon: 'handshake',
      description: 'Conheça nossos valores corporativos, estrutura organizacional, canais de comunicação interna e benefícios.',
      lessons: [
        { id: 'l4-1', title: 'Bem-vindo: Missão, Visão e Valores', duration: '25m', completed: true },
        { id: 'l4-2', title: 'Ferramentas Internas e Sistemas de Acesso', duration: '30m', completed: true },
        { id: 'l4-3', title: 'Políticas de RH, Ponto e Benefícios', duration: '30m', completed: true },
        { id: 'l4-4', title: 'Tour Virtual e Guia dos Departamentos', duration: '20m', completed: true }
      ]
    }
  ];

  certificates: TrainingCertificate[] = [
    {
      id: 'cert-1',
      courseTitle: 'Segurança da Informação e LGPD na Prática Corporativa',
      studentName: 'Colaborador Autorizado',
      issuedAt: '12/10/2026',
      code: 'CI-LGPD-2026-98124',
      hours: 12
    },
    {
      id: 'cert-2',
      courseTitle: 'Integração de Novos Colaboradores (Onboarding Geral)',
      studentName: 'Colaborador Autorizado',
      issuedAt: '05/09/2026',
      code: 'CI-ONB-2026-11409',
      hours: 8
    }
  ];

  // Active Lesson / Player Modal
  activeCourse?: TrainingCourse;
  activeLesson?: CourseLesson;
  showCoursePlayerModal = false;

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
    icon: 'school'
  };

  ngOnInit(): void {}

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

  openCourse(course: TrainingCourse): void {
    this.activeCourse = course;
    this.activeLesson = course.lessons[0];
    this.showCoursePlayerModal = true;
  }

  selectLesson(lesson: CourseLesson): void {
    this.activeLesson = lesson;
  }

  toggleLessonComplete(lesson: CourseLesson): void {
    lesson.completed = !lesson.completed;
    if (this.activeCourse) {
      const total = this.activeCourse.lessons.length;
      const done = this.activeCourse.lessons.filter(l => l.completed).length;
      this.activeCourse.progress = Math.round((done / total) * 100);

      // Check if newly 100% completed to issue certificate
      if (this.activeCourse.progress === 100) {
        const hasCert = this.certificates.some(cert => cert.courseTitle === this.activeCourse?.title);
        if (!hasCert) {
          this.certificates.unshift({
            id: `cert-${Date.now()}`,
            courseTitle: this.activeCourse.title,
            studentName: 'Colaborador Autorizado',
            issuedAt: new Date().toLocaleDateString('pt-BR'),
            code: `CI-${this.activeCourse.id.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
            hours: this.activeCourse.hours
          });
        }
      }
    }
  }

  viewCertificate(cert: TrainingCertificate): void {
    this.selectedCertificate = cert;
    this.showCertModal = true;
  }

  openCreateCourseModal(): void {
    this.newCourse = {
      title: '',
      track: 'Tecnologia & Dev',
      instructor: '',
      hours: 10,
      level: 'Intermediário',
      description: '',
      icon: 'school'
    };
    this.showNewCourseModal = true;
  }

  saveNewCourse(): void {
    if (!this.newCourse.title || !this.newCourse.instructor) return;

    const course: TrainingCourse = {
      id: `c-${Date.now()}`,
      title: this.newCourse.title,
      track: this.newCourse.track || 'Geral',
      instructor: this.newCourse.instructor,
      hours: Number(this.newCourse.hours) || 8,
      lessonsCount: 3,
      level: (this.newCourse.level as any) || 'Iniciante',
      rating: 5.0,
      progress: 0,
      thumbnailColor: '#2563eb',
      icon: this.newCourse.icon || 'school',
      description: this.newCourse.description || '',
      lessons: [
        { id: 'nl-1', title: 'Aula 1: Conceitos e Visão Geral', duration: '20m', completed: false },
        { id: 'nl-2', title: 'Aula 2: Aplicação Prática', duration: '40m', completed: false },
        { id: 'nl-3', title: 'Aula 3: Exercícios e Conclusão', duration: '30m', completed: false }
      ]
    };

    this.courses.unshift(course);
    this.showNewCourseModal = false;
  }
}
