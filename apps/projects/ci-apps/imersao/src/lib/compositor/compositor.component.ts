import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// music-models.ts
export interface Track {
  id: string;
  name: string;
  frequency: number; // Frequência da nota (ex: 440 para Lá)
  steps: boolean[];  // Array de 16 posições indicando onde a nota toca
}

export interface ProjectMaster {
  id?: string;
  projectName: string;
  bpm: number;
  tracks: Track[];
}

@Component({
  selector: 'ci-compositor',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './compositor.component.html',
  styleUrl: './compositor.component.scss',
})
export class CompositorComponent implements OnInit, OnDestroy {
  audioContext!: AudioContext;
  destinationNode!: MediaStreamAudioDestinationNode;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];

  isPlaying = false;
  isRecording = false;
  currentStep = 0;
  timerId: any;

  // Estado do Projeto (O "Master")
  master: ProjectMaster = {
    projectName: 'Nova Composição',
    bpm: 120,
    tracks: [
      { id: '1', name: 'Kick (Baixo)', frequency: 150, steps: new Array(16).fill(false) },
      { id: '2', name: 'Synth (Médio)', frequency: 440, steps: new Array(16).fill(false) },
      { id: '3', name: 'Lead (Alto)', frequency: 880, steps: new Array(16).fill(false) }
    ]
  };

  ngOnInit() {
    this.initAudioEngine();
  }

  ngOnDestroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.stopPlayback();
  }

  private initAudioEngine() {
    this.audioContext = new AudioContext();
    // Nó de destino para capturar o áudio para exportação
    this.destinationNode = this.audioContext.createMediaStreamDestination();

    this.mediaRecorder = new MediaRecorder(this.destinationNode.stream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.downloadAudioFile();
    };
  }

  toggleStep(trackIndex: number, stepIndex: number) {
    this.master.tracks[trackIndex].steps[stepIndex] = !this.master.tracks[trackIndex].steps[stepIndex];
  }

  playNote(frequency: number) {
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;

    // Envelope simples para evitar cliques
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    osc.connect(gainNode);
    // Conecta às caixas de som do usuário
    gainNode.connect(this.audioContext.destination);
    // Conecta ao gravador simultaneamente
    gainNode.connect(this.destinationNode);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  private startPlayback() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.isPlaying = true;
    this.currentStep = 0;

    const stepDurationMs = (60 / this.master.bpm) * 1000 / 4; // 16th notes

    this.timerId = setInterval(() => {
      this.playCurrentStep();
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepDurationMs);
  }

  private playCurrentStep() {
    this.master.tracks.forEach(track => {
      if (track.steps[this.currentStep]) {
        this.playNote(track.frequency);
      }
    });
  }

  stopPlayback() {
    this.isPlaying = false;
    clearInterval(this.timerId);
    this.currentStep = 0;
  }

  // --- FUNÇÕES DE EXPORTAÇÃO ---

  // 1. Salvar o "Master" (Projeto JSON)
  saveMaster() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.master, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${this.master.projectName}-master.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // 2. Exportar o Áudio (Gravar a execução)
  exportAudio() {
    this.recordedChunks = [];
    this.isRecording = true;
    this.mediaRecorder.start();

    // Inicia a música automaticamente para gravar 1 loop (ou pode gravar livremente)
    this.startPlayback();

    // Para a gravação automaticamente após 1 loop completo
    const loopDurationMs = ((60 / this.master.bpm) * 1000 / 4) * 16;
    setTimeout(() => {
      this.stopPlayback();
      this.mediaRecorder.stop();
      this.isRecording = false;
    }, loopDurationMs);
  }

  private downloadAudioFile() {
    const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `${this.master.projectName}-bounce.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}