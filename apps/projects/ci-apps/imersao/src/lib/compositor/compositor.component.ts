import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConsoleVisualizerPlugin } from './plugins/analyzer.plugin';
import { MusicPlugin } from './music-plugin.interface';
import { ProjectMaster, Track, TrackType } from './music-models';
import { DelayPlugin } from './delay.component';
import { MetronomePlugin } from './metronome.plugin';
import { UserAuthenticationService } from '@ci/auth';

@Component({
  selector: 'ci-compositor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
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
  selectedAudioFormat = 'audio/webm';
  selectedMasterFormat = 'json';

  // Sequenciador
  isPlaying = false;
  currentStep = 0;
  masterVolume = 85;
  private timerId: any;

  // Metadados do Master
  master: ProjectMaster = {
    projectName: 'Cyber Beat Studio',
    author: inject(UserAuthenticationService).user.value?.username || 'Produtor CI',
    genre: 'Synthwave',
    description: 'Composição modular procedural criada no Composite-se',
    bpm: 120,
    tracks: [
      { id: '1', name: 'Kick (Bumbo)', type: 'kick', frequency: 150, volume: 0.9, muted: false, solo: false, color: '#ef4444', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
      { id: '2', name: 'Snare (Caixa)', type: 'snare', frequency: 220, volume: 0.8, muted: false, solo: false, color: '#f59e0b', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
      { id: '3', name: 'Hi-Hat (Prato)', type: 'hihat', frequency: 1200, volume: 0.7, muted: false, solo: false, color: '#10b981', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] },
      { id: '4', name: 'Synth Bass', type: 'bass', frequency: 110, volume: 0.85, muted: false, solo: false, color: '#8b5cf6', steps: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false] },
      { id: '5', name: 'Lead Melody', type: 'lead', frequency: 440, volume: 0.75, muted: false, solo: false, color: '#06b6d4', steps: [false, false, true, false, false, true, false, false, false, false, true, false, false, true, false, true] },
      { id: '6', name: 'Ambient Pad', type: 'pad', frequency: 330, volume: 0.65, muted: false, solo: false, color: '#ec4899', steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] }
    ]
  };

  // Plugins disponíveis
  availablePlugins = [
    { id: 'delay', name: 'Efeito: Delay Espacial', instance: new DelayPlugin(), enabled: true },
    { id: 'metro', name: 'Instrumento: Metrônomo', instance: new MetronomePlugin(), enabled: false },
    { id: 'vis', name: 'Analisador de Volume', instance: new ConsoleVisualizerPlugin(), enabled: false }
  ];
  activePlugins: MusicPlugin[] = [];

  ngOnInit() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterBus = this.audioContext.createGain();
    this.setMasterGain(this.masterVolume);
    this.destinationNode = this.audioContext.createMediaStreamDestination();

    // Inicia os plugins que já vierem marcados
    this.availablePlugins.forEach(p => {
      if (p.enabled) {
        p.instance.init(this.audioContext);
        this.activePlugins.push(p.instance);
      }
    });

    this.rebuildAudioChain();
  }

  ngOnDestroy() {
    this.stopPlayback();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  // --- GERENCIAMENTO DE VOLUME E ÁUDIO ---
  setMasterGain(vol: number): void {
    if (this.masterBus && this.audioContext) {
      this.masterBus.gain.setValueAtTime(vol / 100, this.audioContext.currentTime);
    }
  }

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
    this.masterBus.disconnect();
    let currentOutput: AudioNode = this.masterBus;
    const effectPlugins = this.activePlugins.filter(p => p.setupAudioChain);

    effectPlugins.forEach(plugin => {
      const nextInput = this.audioContext.createGain();
      plugin.setupAudioChain!(currentOutput, nextInput);
      currentOutput = nextInput;
    });

    currentOutput.connect(this.audioContext.destination);
    currentOutput.connect(this.destinationNode);
  }

  // --- CONTROLES DE PISTA (SOLO / MUTE / VOLUME) ---
  toggleMute(track: Track): void {
    track.muted = !track.muted;
  }

  toggleSolo(track: Track): void {
    track.solo = !track.solo;
  }

  hasSoloActive(): boolean {
    return this.master.tracks.some(t => t.solo);
  }

  isTrackAudible(track: Track): boolean {
    if (track.muted) return false;
    if (this.hasSoloActive()) {
      return !!track.solo;
    }
    return true;
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
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.isPlaying = true;
    this.currentStep = 0;
    const stepMs = (60 / this.master.bpm) * 1000 / 4;

    this.timerId = setInterval(() => {
      // Toca notas ativas
      this.master.tracks.forEach(track => {
        if (track.steps[this.currentStep] && this.isTrackAudible(track)) {
          this.triggerTrackSound(track);
        }
      });

      // Plugins de relógio
      this.activePlugins.forEach(plugin => {
        if (plugin.onStep) plugin.onStep(this.currentStep, this.master.bpm);
      });

      this.currentStep = (this.currentStep + 1) % 16;
    }, stepMs);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
  }

  // --- SÍNTESE DE ÁUDIO MULTI-INSTRUMENTO ---
  private triggerTrackSound(track: Track) {
    const vol = track.volume ?? 0.8;
    switch (track.type) {
      case 'kick':
        this.synthKick(vol);
        break;
      case 'snare':
        this.synthSnare(vol);
        break;
      case 'hihat':
        this.synthHiHat(vol);
        break;
      case 'bass':
        this.synthBass(track.frequency || 110, vol);
        break;
      case 'pad':
        this.synthPad(track.frequency || 330, vol);
        break;
      case 'lead':
      default:
        this.synthLead(track.frequency || 440, vol);
        break;
    }
  }

  private synthKick(vol: number) {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);

    gain.gain.setValueAtTime(vol * 1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterBus);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  private synthSnare(vol: number) {
    const now = this.audioContext.currentTime;
    // 1. Noise burst
    const bufferSize = this.audioContext.sampleRate * 0.15;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterBus);
    noise.start(now);

    // 2. Tonal Body
    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(vol * 0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.masterBus);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  private synthHiHat(vol: number) {
    const now = this.audioContext.currentTime;
    const bufferSize = this.audioContext.sampleRate * 0.05;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(vol * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterBus);
    noise.start(now);
  }

  private synthBass(freq: number, vol: number) {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.2);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(vol * 0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterBus);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private synthLead(freq: number, vol: number) {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2400;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol * 0.6, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterBus);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  private synthPad(freq: number, vol: number) {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol * 0.5, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterBus);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // --- PRESETS DE GÊNEROS ---
  applyPreset(preset: 'synthwave' | 'techno' | 'trap' | 'lofi' | 'clear'): void {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.stopPlayback();

    switch (preset) {
      case 'synthwave':
        this.master.bpm = 120;
        this.master.genre = 'Synthwave 80s';
        this.setTrackSteps('kick', [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]);
        this.setTrackSteps('snare', [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]);
        this.setTrackSteps('hihat', [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]);
        this.setTrackSteps('bass', [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false]);
        this.setTrackSteps('lead', [false, false, true, false, false, true, false, false, false, false, true, false, false, true, false, true]);
        this.setTrackSteps('pad', [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false]);
        break;

      case 'techno':
        this.master.bpm = 132;
        this.master.genre = 'Berlin Techno';
        this.setTrackSteps('kick', [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]);
        this.setTrackSteps('snare', [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]);
        this.setTrackSteps('hihat', [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false]);
        this.setTrackSteps('bass', [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]);
        this.setTrackSteps('lead', [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]);
        this.setTrackSteps('pad', [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]);
        break;

      case 'trap':
        this.master.bpm = 140;
        this.master.genre = 'Trap / Hip-Hop';
        this.setTrackSteps('kick', [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false]);
        this.setTrackSteps('snare', [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]);
        this.setTrackSteps('hihat', [true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true]);
        this.setTrackSteps('bass', [true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false]);
        this.setTrackSteps('lead', [false, false, false, true, false, false, false, false, false, false, false, true, false, false, true, false]);
        this.setTrackSteps('pad', [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]);
        break;

      case 'lofi':
        this.master.bpm = 84;
        this.master.genre = 'Lo-Fi Chill';
        this.setTrackSteps('kick', [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false]);
        this.setTrackSteps('snare', [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]);
        this.setTrackSteps('hihat', [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false]);
        this.setTrackSteps('bass', [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false]);
        this.setTrackSteps('lead', [false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, true]);
        this.setTrackSteps('pad', [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false]);
        break;

      case 'clear':
        this.master.tracks.forEach(t => t.steps = new Array(16).fill(false));
        break;
    }

    if (wasPlaying) this.startPlayback();
  }

  private setTrackSteps(type: TrackType, steps: boolean[]): void {
    const track = this.master.tracks.find(t => t.type === type);
    if (track) {
      track.steps = [...steps];
    }
  }

  // --- IMPORT & EXPORT ---
  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const raw = e.target.result;
          let parsed: any;
          if (file.name.endsWith('.ciproj')) {
            parsed = JSON.parse(atob(raw));
          } else {
            parsed = JSON.parse(raw);
          }
          if (parsed && parsed.tracks) {
            this.master = parsed;
          }
        } catch (err) {
          console.error('Falha ao importar projeto:', err);
        }
      };
      reader.readAsText(file);
    }
  }

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
        dataStr = btoa(jsonData);
        mimeType = 'text/plain';
        extension = '.ciproj';
        break;
      case 'txt':
        dataStr = `Projeto: ${this.master.projectName}\nAutor: ${this.master.author}\nGênero: ${this.master.genre}\nBPM: ${this.master.bpm}\nTracks: ${this.master.tracks.length}`;
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

    const options = MediaRecorder.isTypeSupported(this.selectedAudioFormat)
      ? { mimeType: this.selectedAudioFormat }
      : undefined;

    this.mediaRecorder = new MediaRecorder(this.destinationNode.stream, options);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.recordedChunks.push(event.data);
    };

    this.mediaRecorder.onstop = () => {
      const ext = this.selectedAudioFormat.split('/')[1].split(';')[0];
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
