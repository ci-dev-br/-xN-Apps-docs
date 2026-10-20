import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  activeTab: 'metas' | 'flashcards' | 'turmas' | 'caderno' = 'metas';

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
  notes: StudyNote[] = [
    {
      id: 'n-1',
      title: 'Resumo sobre Design Patterns Comportamentais',
      subject: 'Engenharia de Software',
      content: 'Observer: desacopla o sujeito dos observadores. Strategy: encapsula famílias de algoritmos para serem intercambiáveis.',
      updatedAt: '20/10/2026',
      tags: ['Design Patterns', 'Arquitetura', 'GoF']
    },
    {
      id: 'n-2',
      title: 'Tópicos Chave de Governança de Dados',
      subject: 'Compliance',
      content: 'Princípio do privilégio mínimo (PoLP), anonimização e pseudonimização, retenção controlada de logs com expiração automática.',
      updatedAt: '18/10/2026',
      tags: ['LGPD', 'Segurança', 'Governança']
    }
  ];

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

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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
    this.newNote = { title: '', subject: 'Geral', content: '', tags: [] };
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

  saveNewNote(): void {
    if (!this.newNote.title || !this.newNote.content) return;
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

  deleteNote(id: string): void {
    this.notes = this.notes.filter(n => n.id !== id);
  }
}
