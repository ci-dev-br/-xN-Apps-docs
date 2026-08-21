import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Optional, Output, ViewChild, NgZone } from '@angular/core';
import { FormControlDirective, FormGroupDirective, FormGroup } from '@angular/forms';
import { GeradorDeNomes } from './geradore-nome';

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

  @Output('+confirm') confirmOutput = new EventEmitter<any>();
  @Input() form?: FormGroup<any>;

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

  // Tolerância ajustada: 25Hz é o ideal para diferenciar locutores sem criar nomes repetidos 
  // para a mesma pessoa quando ela muda a entonação.
  private readonly HZ_TOLERANCE: number = 25;
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

  // ==========================================
  // RECURSO DE TRANSCRIÇÃO AVANÇADA
  // ==========================================

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
          console.info('Diarização desativada (comum em mobile). Utilizando apenas um único locutor genérico.', mediaError);
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

    // Opcional: Se quiser resetar os falantes a cada nova gravação, 
    // descomente a linha abaixo. Caso queira que ele lembre das vozes enquanto a página 
    // não for atualizada, mantenha comentado.
    // this.knownSpeakers = []; 
  }

  private setupAudioAnalysis(stream: MediaStream) {
    if (!this.audioContext) return;
    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
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

      for (let i = 1; i < 50; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }

      // Threshold ajustado para 35: forte o suficiente para ignorar ruído de ventoinhas
      // e chiados estáticos, mas sensível para voz.
      if (maxValue > 35) {
        const hz = (maxIndex * this.audioContext.sampleRate) / this.analyser.fftSize;

        if (hz > 60 && hz < 500) {
          this.pitchTracker.push(hz);
        }
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
      // 1. Garante um nome logo na partida (mesmo que seja silêncio ou mobile sem acesso ao mic)
      if (!this.lastIdentifiedSpeaker) {
        this.lastIdentifiedSpeaker = this.geradorNome.gerarNomeCompleto(Math.floor(Math.random() * 5));
      }

      // 2. Se a frase foi muito rápida ou o threshold cortou (ruído), confia no nome atual
      if (this.pitchTracker.length < 3) {
        return this.lastIdentifiedSpeaker;
      }

      const medianHz = this.getMedian(this.pitchTracker);

      // 3. A CORREÇÃO CHAVE: Cadastra a primeira pessoa com a frequência dela
      if (this.knownSpeakers.length === 0) {
        this.knownSpeakers.push({
          nickname: this.lastIdentifiedSpeaker,
          medianHz: medianHz
        });
        return this.lastIdentifiedSpeaker;
      }

      // 4. Procura quem é o locutor na lista
      const matchedSpeaker = this.knownSpeakers.find(
        speaker => Math.abs(speaker.medianHz - medianHz) <= this.HZ_TOLERANCE
      );

      if (matchedSpeaker) {
        this.lastIdentifiedSpeaker = matchedSpeaker.nickname;
        return matchedSpeaker.nickname;
      }

      // 5. Se não encontrou, é uma nova pessoa
      const newNickname = this.availableNicknames.length > 0
        ? this.availableNicknames.shift()!
        : this.geradorNome.gerarNomeCompleto(Math.floor(Math.random() * 5));

      this.knownSpeakers.push({
        nickname: newNickname,
        medianHz: medianHz
      });

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