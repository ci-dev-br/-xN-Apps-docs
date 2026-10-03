import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConsoleVisualizerPlugin } from './plugins/analyzer.plugin';
import { MusicPlugin } from './music-plugin.interface';
import { ProjectMaster, Track } from './music-models';
import { DelayPlugin } from './delay.component';
import { MetronomePlugin } from './metronome.plugin';
import { UserAuthenticationService } from '@ci/auth';
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
  masterBus!: GainNode;
  destinationNode!: MediaStreamAudioDestinationNode;
  // Estado e Gravação
  isRecording = false;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  selectedAudioFormat: string = 'audio/webm'; // Formato de áudio padrão
  selectedMasterFormat: string = 'json';      // Formato de projeto padrão
  // Sequenciador
  isPlaying = false;
  currentStep = 0;
  private timerId: any;
  // Metadados do Master
  master: ProjectMaster = {
    projectName: 'Nova Composição',
    author: inject(UserAuthenticationService).user.value?.username || '',
    genre: 'Eletrônica',
    description: 'Um beat gerado proceduralmente',
    bpm: 120,
    tracks: [
      { id: '1', name: 'Kick (Baixo)', frequency: 150, steps: new Array(16).fill(false) },
      { id: '2', name: 'Synth (Médio)', frequency: 440, steps: new Array(16).fill(false) },
      { id: '3', name: 'Lead (Alto)', frequency: 880, steps: new Array(16).fill(false) }
    ]
  };
  // Catálogo de plugins disponíveis na interface
  availablePlugins = [
    { id: 'delay', name: 'Efeito: Delay Espacial', instance: new DelayPlugin(), enabled: false },
    { id: 'metro', name: 'Instrumento: Metrônomo', instance: new MetronomePlugin(), enabled: false },
    { id: 'vis', name: 'Analisador de Volume', instance: new ConsoleVisualizerPlugin(), enabled: false }
  ];
  activePlugins: MusicPlugin[] = [];
  ngOnInit() {
    this.audioContext = new AudioContext();
    this.masterBus = this.audioContext.createGain();
    this.destinationNode = this.audioContext.createMediaStreamDestination();
    // Conecta inicialmente a rota de áudio base (sem efeitos)
    this.rebuildAudioChain();
  }
  ngOnDestroy() {
    if (this.audioContext) this.audioContext.close();
    this.stopPlayback();
  }
  // --- GERENCIAMENTO DE PLUGINS E ÁUDIO ---
  togglePlugin(pluginItem: any) {
    pluginItem.enabled = !pluginItem.enabled;
    if (pluginItem.enabled) {
      pluginItem.instance.init(this.audioContext);
      this.activePlugins.push(pluginItem.instance);
    } else {
      this.activePlugins = this.activePlugins.filter((p: any) => p !== pluginItem.instance);
      if (pluginItem.instance.destroy) pluginItem.instance.destroy();
    }
    this.rebuildAudioChain();
  }
  rebuildAudioChain() {
    this.masterBus.disconnect(); // Reseta conexões
    let currentOutput: AudioNode = this.masterBus;
    const effectPlugins = this.activePlugins.filter(p => p.setupAudioChain);
    // Encadeia os plugins habilitados
    effectPlugins.forEach(plugin => {
      const nextInput = this.audioContext.createGain();
      plugin.setupAudioChain!(currentOutput, nextInput);
      currentOutput = nextInput;
    });
    // Final da corrente liga nas caixas de som E no gravador
    currentOutput.connect(this.audioContext.destination);
    currentOutput.connect(this.destinationNode);
  }
  // --- MOTOR DO SEQUENCIADOR ---
  toggleStep(trackIndex: number, stepIndex: number) {
    this.master.tracks[trackIndex].steps[stepIndex] = !this.master.tracks[trackIndex].steps[stepIndex];
  }
  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }
  startPlayback() {
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
    this.isPlaying = true;
    this.currentStep = 0;
    const stepMs = (60 / this.master.bpm) * 1000 / 4;
    this.timerId = setInterval(() => {
      // 1. Toca as notas que estão marcadas no step atual
      this.master.tracks.forEach(track => {
        if (track.steps[this.currentStep]) {
          this.playNote(track.frequency);
        }
      });
      // 2. Notifica os plugins do relógio (para Metrônomo, Arpejadores, etc)
      this.activePlugins.forEach(plugin => {
        if (plugin.onStep) plugin.onStep(this.currentStep, this.master.bpm);
      });
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepMs);
  }
  stopPlayback() {
    this.isPlaying = false;
    clearInterval(this.timerId);
    this.currentStep = 0;
  }
  // Gera o som básico passando pelo MasterBus
  private playNote(frequency: number) {
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    osc.connect(gainNode);
    gainNode.connect(this.masterBus); // Som vai para a cadeia principal
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }
  // --- EXPORTAÇÃO ---
  exportMaster() {
    let dataStr = '';
    let mimeType = 'text/plain';
    let extension = '';
    const jsonData = JSON.stringify(this.master, null, 2);
    switch (this.selectedMasterFormat) {
      case 'json':
        dataStr = jsonData;
        mimeType = 'application/json';
        extension = '.json';
        break;
      case 'b64':
        dataStr = btoa(jsonData); // Formato customizado ofuscado
        mimeType = 'text/plain';
        extension = '.ciproj';
        break;
      case 'txt':
        dataStr = `Projeto: ${this.master.projectName}\nAutor: ${this.master.author}\nGênero: ${this.master.genre}\nBPM: ${this.master.bpm}\n\nTracks configurados: ${this.master.tracks.length}`;
        extension = '.txt';
        break;
    }
    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `${this.master.projectName.replace(/\s+/g, '-')}${extension}`);
  }
  exportAudio() {
    this.recordedChunks = [];
    this.isRecording = true;
    // Tenta usar o formato selecionado, ou cai pro webm por fallback
    const options = MediaRecorder.isTypeSupported(this.selectedAudioFormat)
      ? { mimeType: this.selectedAudioFormat }
      : undefined;
    this.mediaRecorder = new MediaRecorder(this.destinationNode.stream, options);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.recordedChunks.push(event.data);
    };
    this.mediaRecorder.onstop = () => {
      const ext = this.selectedAudioFormat.split('/')[1].split(';')[0]; // ex: audio/ogg -> ogg
      const blob = new Blob(this.recordedChunks, { type: this.selectedAudioFormat });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, `${this.master.projectName.replace(/\s+/g, '-')}-bounce.${ext}`);
    };
    this.mediaRecorder.start();
    this.startPlayback();
    const loopDurationMs = ((60 / this.master.bpm) * 1000 / 4) * 16;
    setTimeout(() => {
      this.stopPlayback();
      this.mediaRecorder.stop();
      this.isRecording = false;
    }, loopDurationMs);
  }
  private triggerDownload(url: string, filename: string) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}