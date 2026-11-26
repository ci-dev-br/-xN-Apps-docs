import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  output,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

// --- COMPONENTE FILHO: VISUALIZADOR E PROCESSADOR DE ÁUDIO ---
@Component({
  selector: 'app-audio-visualizer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    mat-card {
      background: #111827;
      color: #f3f4f6;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #374151;
      box-sizing: border-box;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    mat-form-field {
      flex: 1;
      min-width: 260px;
      width: 100%;
    }

    div[role="region"] {
      position: relative;
      width: 100%;
      height: 192px;
      background-color: #000;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #374151;
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    aside {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
    }

    p[role="alert"] {
      margin-top: 16px;
      color: #f43f5e;
      background-color: rgba(76, 5, 25, 0.5);
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #881337;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
  template: `
    <mat-card>
      <header>
        <mat-form-field appearance="outline">
          <mat-label>Selecione o Microfone</mat-label>
          <mat-select [value]="selectedDeviceId()" (selectionChange)="onDeviceChange($event.value)">
            @for (device of audioDevices(); track device.deviceId) {
              <mat-option [value]="device.deviceId">{{ device.label || 'Microfone ' + ($index + 1) }}</mat-option>
            }
            @if (audioDevices().length === 0) {
              <mat-option value="">Aguardando permissão...</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <button 
          mat-flat-button 
          color="primary"
          [disabled]="isRecording()"
          (click)="startRecording()"
          [style.background-color]="isRecording() ? '#f43f5e' : '#0891b2'">
          @if (isRecording()) {
            <mat-icon>fiber_manual_record</mat-icon>
            Gravando Referência...
          } @else {
            <mat-icon>mic</mat-icon>
            Gravar Gatilho (2s)
          }
        </button>
      </header>

      <div role="region" aria-label="Visualizador de Áudio">
        <canvas #audioCanvas></canvas>
        
        @if (hasReference()) {
          <aside>
            <mat-chip-set>
              <mat-chip style="background-color: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);">
                Monitorando Gatilho
              </mat-chip>
            </mat-chip-set>
          </aside>
        }
      </div>
      
      @if (permissionError()) {
        <p role="alert">
          Erro de acesso: Permita o uso do microfone no seu navegador para utilizar este componente.
        </p>
      }
    </mat-card>
  `
})
export class AudioVisualizerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('audioCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  triggerFired = output<void>();

  audioDevices = signal<MediaDeviceInfo[]>([]);
  selectedDeviceId = signal<string>('');
  isRecording = signal<boolean>(false);
  hasReference = signal<boolean>(false);
  permissionError = signal<boolean>(false);

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationId: number = 0;

  private recordedProfile = new Float32Array();
  private recordSamples = 0;
  private referenceEnergy = 0;
  private lastTriggerTime = 0;

  ngAfterViewInit() {
    this.initAudio();
  }

  ngOnDestroy() {
    this.stopEverything();
  }

  async initAudio() {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');

      this.audioDevices.set(audioInputs);
      this.permissionError.set(false);

      if (audioInputs.length > 0) {
        const defaultDeviceId = audioInputs[0].deviceId;
        this.selectedDeviceId.set(defaultDeviceId);
        this.startStream(defaultDeviceId);
      }

      tempStream.getTracks().forEach(t => t.stop());
    } catch (err) {
      console.error('Erro ao acessar dispositivos de áudio:', err);
      this.permissionError.set(true);
    }
  }

  async startStream(deviceId: string) {
    this.stopCurrentStream();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      });

      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;

      const source = this.audioCtx.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      this.drawLoop();
    } catch (err) {
      console.error('Erro ao iniciar stream de áudio:', err);
    }
  }

  onDeviceChange(deviceId: string) {
    this.selectedDeviceId.set(deviceId);
    this.startStream(deviceId);
  }

  startRecording() {
    if (!this.analyser || this.isRecording()) return;

    this.isRecording.set(true);
    this.hasReference.set(false);
    this.recordSamples = 0;

    const binCount = this.analyser.frequencyBinCount;
    this.recordedProfile = new Float32Array(binCount);

    setTimeout(() => {
      this.isRecording.set(false);
      this.hasReference.set(true);

      let maxEnergy = 0;
      for (let i = 0; i < binCount; i++) {
        this.recordedProfile[i] /= this.recordSamples;
        maxEnergy += this.recordedProfile[i];
      }
      this.referenceEnergy = maxEnergy;

    }, 2000);
  }

  private drawLoop() {
    if (!this.analyser || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeDomainData = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);

      if (!this.analyser) return;

      this.analyser.getByteTimeDomainData(timeDomainData);
      this.analyser.getByteFrequencyData(frequencyData);

      if (this.isRecording()) {
        this.processRecording(frequencyData);
      } else if (this.hasReference()) {
        this.checkTrigger(frequencyData);
      }

      this.renderWaveform(ctx, canvas, timeDomainData, bufferLength);
    };

    draw();
  }

  private renderWaveform(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, bufferLength: number) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 3;

    if (this.isRecording()) {
      ctx.strokeStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
    } else if (this.hasReference()) {
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
    } else {
      ctx.strokeStyle = '#0ea5e9';
      ctx.shadowColor = '#0ea5e9';
    }

    ctx.shadowBlur = 10;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = data[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  private processRecording(frequencyData: Uint8Array) {
    for (let i = 0; i < frequencyData.length; i++) {
      this.recordedProfile[i] += frequencyData[i];
    }
    this.recordSamples++;
  }

  private checkTrigger(currentFreq: Uint8Array) {
    const now = Date.now();
    if (now - this.lastTriggerTime < 1500) return;

    let currentEnergy = 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < currentFreq.length; i++) {
      const currentVal = currentFreq[i];
      const refVal = this.recordedProfile[i];

      currentEnergy += currentVal;

      dotProduct += currentVal * refVal;
      normA += currentVal ** 2;
      normB += refVal ** 2;
    }

    if (currentEnergy < this.referenceEnergy * 0.6) {
      return;
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

    if (similarity > 0.88) {
      this.triggerFired.emit();
      this.lastTriggerTime = now;
    }
  }

  private stopCurrentStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  private stopEverything() {
    cancelAnimationFrame(this.animationId);
    this.stopCurrentStream();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// --- COMPONENTE PAI: APLICAÇÃO PRINCIPAL ---
@Component({
  selector: 'ci-audio-track',
  standalone: true,
  imports: [CommonModule, AudioVisualizerComponent, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #030712;
      color: #f3f4f6;
      font-family: Roboto, "Helvetica Neue", sans-serif;
      padding: 24px;
      box-sizing: border-box;
      transition: background-color 0.3s ease;
    }

    main {
      min-height: calc(100vh - 48px);
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    section {
      max-width: 896px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    figure {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background-color: rgba(8, 145, 178, 0.2);
      border-radius: 9999px;
      margin: 0 0 16px 0;
      border: 1px solid rgba(6, 182, 212, 0.5);
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      background: linear-gradient(to right, #22d3ee, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 8px 0;
    }

    p {
      color: #9ca3af;
      max-width: 512px;
      margin: 0 auto;
      font-size: 1rem;
    }

    article {
      margin-top: 48px;
      text-align: center;
      width: 100%;
      max-width: 384px;
    }

    mat-card {
      background: #111827 !important;
      color: #f3f4f6 !important;
      border-radius: 16px !important;
      padding: 24px;
      border: 1px solid #1f2937 !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
      position: relative;
      overflow: hidden;
    }

    div[aria-hidden="true"] {
      position: absolute;
      inset: 0;
      background-color: rgba(16, 185, 129, 0.2);
      z-index: 0;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    data {
      font-size: 3.75rem;
      font-weight: 900;
      font-variant-numeric: tabular-nums;
      transition: color 0.3s ease;
      display: block;
      margin: 8px 0;
    }

    footer {
      height: 32px;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background-color: rgba(16, 185, 129, 0.2);
      color: #4ade80;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .flash-bg {
      background-color: #022c22 !important;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `],
  template: `
    <main [class.flash-bg]="isFlashActive()">
      <section>
        <header>
          <figure>
            <mat-icon style="color: #22d3ee; width: 32px; height: 32px; font-size: 32px;">mic</mat-icon>
          </figure>
          <h1>Detector de Gatilho Sonoro</h1>
          <p>
            Grave um som de referência (como um assobio, estalo ou palma). O sistema ficará escutando e reagirá sempre que ouvir o mesmo padrão sonoro.
          </p>
        </header>

        <app-audio-visualizer (triggerFired)="onTriggerFired()"></app-audio-visualizer>

        <article>
          <mat-card>
            @if (isFlashActive()) {
              <div aria-hidden="true"></div>
            }

            <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center;">
              <h3 style="font-size: 0.875rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Acionamentos</h3>
              <data [style.color]="isFlashActive() ? '#4ade80' : '#e5e7eb'">
                {{ triggerCount() }}
              </data>
              
              <footer>
                @if (isFlashActive()) {
                  <span>
                    <mat-icon style="width: 16px; height: 16px; font-size: 16px;">check</mat-icon>
                    Som Detectado!
                  </span>
                }
              </footer>
            </div>
          </mat-card>
        </article>
      </section>
    </main>
  `
})
export class AudioTrackComponent {
  triggerCount = signal<number>(0);
  isFlashActive = signal<boolean>(false);
  private flashTimeoutId: any;

  onTriggerFired() {
    this.triggerCount.update(c => c + 1);
    this.isFlashActive.set(true);

    if (this.flashTimeoutId) {
      clearTimeout(this.flashTimeoutId);
    }

    this.flashTimeoutId = setTimeout(() => {
      this.isFlashActive.set(false);
    }, 1000);
  }
}