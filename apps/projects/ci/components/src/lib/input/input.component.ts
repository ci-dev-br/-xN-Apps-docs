import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Optional, Output, ViewChild, NgZone } from '@angular/core';
import { FormControlDirective, FormGroupDirective, FormGroup } from '@angular/forms';
import { GeradorDeNomes } from './geradore-nome';
import { PitchSettings } from './pitch-controls.component';

export interface SpeakerProfile {
  nickname: string;
  medianHz: number;
}

@Component({
  selector: 'ci-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  standalone: false
})
export class InputComponent implements OnInit {
  @Input() mode?: 'input' | 'content-editable' = 'input';
  @Input() stage?: 'edit' | 'view' = 'view';
  @Input() fieldName?: string;
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() el?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'sub' | 'html' | undefined;

  @Output('confirm') confirmOutput = new EventEmitter<any>();
  @Input() form?: FormGroup<any>;

  // ==========================================
  // PARÂMETROS DE CALIBRAÇÃO (Ajuste via Template)
  // ==========================================

  // Margem de erro em Hz para considerar que é a mesma pessoa falando
  @Input() pitchTolerance: number = 5.6;

  // Volume mínimo (0 a 255) para considerar que é uma voz e não ruído de fundo
  @Input() minVolume: number = 0;

  // Corte de frequências (Filtro Passa-Banda para ignorar graves de motor e agudos de chiado)
  @Input() minHz: number = 60;
  @Input() maxHz: number = 700;

  // Quantidade mínima de capturas válidas (a cada 50ms) para calcular um pitch confiável. 
  // Evita que um suspiro ou tosse curta crie uma nova pessoa.
  @Input() minSamples: number = 1;

  // Ative para ver os valores exatos de Hz no console do navegador e facilitar a calibração
  @Input() debugPitch: boolean = true;

  onPitchSettingsChange(event: PitchSettings) {
    this.pitchTolerance = event.pitchTolerance;
    this.minVolume = event.minVolume;
    this.minHz = event.minHz;
    this.maxHz = event.maxHz;
    this.minSamples = event.minSamples;
    this.debugPitch = event.debugPitch;
  }

  private _input?: ElementRef<HTMLInputElement>;

  @ViewChild('input', { static: false })
  set input(value) {
    if (this._input === value) return;
    this._input = value;
    setTimeout(() => {
      if (value?.nativeElement) value.nativeElement.focus();
    });
  }
  get input() { return this._input; }

  value?: any;

  // --- Propriedades de Transcrição e Áudio ---
  isRecording = false;
  liveDraft = '';

  private recognition: any;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private microphoneStream?: MediaStream;

  private pitchTracker: number[] = [];
  private trackingInterval: any;

  private lastIdentifiedSpeaker: string = '';

  private commitTimeout: any;
  private pendingTranscript: string = '';

  private knownSpeakers: SpeakerProfile[] = [];
  private availableNicknames: string[] = [];

  geradorNome = new GeradorDeNomes();

  constructor(
    @Optional() private readonly formGroupDirective?: FormGroupDirective,
    @Optional() private readonly formControlDirective?: FormControlDirective,
    private ngZone?: NgZone
  ) { }

  ngOnInit() {
    if (this.formGroupDirective?.form && this.fieldName) {
      this.form = this.formGroupDirective.form;
      let control = this.formGroupDirective.form.get(this.fieldName);
      this.value = control?.value;
      control?.valueChanges.subscribe(newValue => {
        this.value = newValue;
      });
    }
  }

  async confirm(event: MouseEvent | Event) { }

  @HostListener('click')
  async clickHandler() {
    if (this.stage === 'view') this.stage = 'edit';
  }

  @HostListener('keydown', ['$event'])
  async keydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.stage = 'view';
    }
  }

  private getAudioContextClass(): any {
    return (window as any).AudioContext || (window as any).webkitAudioContext;
  }

  async toggleTranscription() {
    if (this.isRecording) {
      this.stopTranscription();
    } else {
      if (!this.audioContext) {
        const AudioCtx = this.getAudioContextClass();
        if (AudioCtx) this.audioContext = new AudioCtx();
      }

      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.startTranscription();
    }
  }

  private async startTranscription() {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Reconhecimento de voz não suportado neste navegador.');
        return;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalSegment = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSegment += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        this.ngZone?.run(() => {
          this.liveDraft = (this.pendingTranscript + ' ' + interimTranscript).trim();

          if (finalSegment) {
            this.pendingTranscript += ' ' + finalSegment;
            this.liveDraft = this.pendingTranscript.trim();

            if (this.commitTimeout) clearTimeout(this.commitTimeout);

            this.commitTimeout = setTimeout(() => {
              this.processAndCommitPendingTranscript();
            }, 700);
          }
        });
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Alerta na transcrição:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isRecording = false;
        }
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          setTimeout(() => {
            if (this.isRecording) {
              try { this.recognition.start(); } catch (e) { }
            }
          }, 50);
        }
      };

      this.recognition.start();
      this.isRecording = true;

      setTimeout(async () => {
        try {
          if (!this.microphoneStream) {
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.setupAudioAnalysis(this.microphoneStream);
            this.startPitchTracking();
          }
        } catch (mediaError) {
          console.info('Diarização desativada. Utilizando apenas um locutor.', mediaError);
        }
      }, 200);

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      this.isRecording = false;
    }
  }

  private processAndCommitPendingTranscript() {
    if (!this.pendingTranscript.trim()) return;

    const speaker = this.identifySpeakerByHz();
    this.commitTranscript(speaker, this.pendingTranscript);

    this.pendingTranscript = '';
    this.liveDraft = '';
    this.pitchTracker = [];
  }

  private stopTranscription() {
    this.isRecording = false;

    if (this.commitTimeout) clearTimeout(this.commitTimeout);
    if (this.pendingTranscript.trim()) {
      this.processAndCommitPendingTranscript();
    }

    if (this.recognition) this.recognition.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = undefined;
    }
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = undefined;
    }

    clearInterval(this.trackingInterval);
    this.liveDraft = '';
    this.pitchTracker = [];
    this.lastIdentifiedSpeaker = '';
    this.knownSpeakers = []; // Resetando na V5 para facilitar novos testes sem recarregar a página
  }

  private setupAudioAnalysis(stream: MediaStream) {
    if (!this.audioContext) return;
    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      // Aumentando a resolução da FFT ajuda a ser mais preciso na varredura
      this.analyser.fftSize = 4096;
    }
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
  }

  private startPitchTracking() {
    if (this.trackingInterval) clearInterval(this.trackingInterval);

    this.trackingInterval = setInterval(() => {
      if (!this.analyser || !this.audioContext || !this.isRecording) return;

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      let maxIndex = 0;
      let maxValue = 0;

      // Calculando dinamicamente as "bandejas" (bins) da FFT baseado no minHz e maxHz configurado
      const hzPerBin = this.audioContext.sampleRate / this.analyser.fftSize;
      const minBin = Math.floor(this.minHz / hzPerBin);
      const maxBin = Math.ceil(this.maxHz / hzPerBin);

      for (let i = minBin; i <= maxBin; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }

      if (maxValue > this.minVolume) {
        const hz = maxIndex * hzPerBin;
        this.pitchTracker.push(hz);
      }
    }, 50);
  }

  private getMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  private identifySpeakerByHz(): string {
    try {
      if (!this.lastIdentifiedSpeaker) {
        this.lastIdentifiedSpeaker = this.geradorNome.gerarNomeCompleto(Math.floor(Math.random() * 5));
      }

      // Se a pessoa não falou o tempo mínimo (ex: tossiu rápido), descarta a avaliação
      if (this.pitchTracker.length < this.minSamples) {
        if (this.debugPitch) console.log(`[Pitch Debug] Poucas amostras (${this.pitchTracker.length}). Mantendo: ${this.lastIdentifiedSpeaker}`);
        return this.lastIdentifiedSpeaker;
      }

      const medianHz = this.getMedian(this.pitchTracker);

      if (this.debugPitch) {
        console.log(`[Pitch Debug] Mediana detectada: ${medianHz.toFixed(2)}Hz | Amostras: ${this.pitchTracker.length}`);
        /*  console.log(`[Pitch Debug] Base de locutores atual:`, JSON.parse(JSON .stringify(this.knownSpeakers))); */
      }

      if (this.knownSpeakers.length === 0) {
        this.knownSpeakers.push({
          nickname: this.lastIdentifiedSpeaker,
          medianHz: medianHz
        });
        return this.lastIdentifiedSpeaker;
      }

      const matchedSpeaker = this.knownSpeakers.find(
        speaker => Math.abs(speaker.medianHz - medianHz) <= this.pitchTolerance
      );

      if (matchedSpeaker) {
        this.lastIdentifiedSpeaker = matchedSpeaker.nickname;
        return matchedSpeaker.nickname;
      }

      const newNickname = this.availableNicknames.length > 0
        ? this.availableNicknames.shift()!
        : this.geradorNome.gerarNomeCompleto(Math.floor(Math.random() * 5));

      this.knownSpeakers.push({
        nickname: newNickname,
        medianHz: medianHz
      });

      if (this.debugPitch) console.log(`[Pitch Debug] NOVO LOCUTOR detectado! Nome: ${newNickname} | Frequência Base: ${medianHz.toFixed(2)}Hz`);

      this.lastIdentifiedSpeaker = newNickname;
      return newNickname;

    } catch (error) {
      return this.lastIdentifiedSpeaker;
    }
  }

  private commitTranscript(speaker: string, transcript: string) {
    const formattedText = `\n[${speaker}]: ${transcript.trim()}`;

    if (this.form && this.fieldName) {
      const control = this.form.get(this.fieldName);
      const currentValue = control?.value || '';
      control?.patchValue(`${currentValue} ${formattedText}`);
    } else {
      this.value = `${this.value || ''} ${formattedText}`;
    }
  }
}