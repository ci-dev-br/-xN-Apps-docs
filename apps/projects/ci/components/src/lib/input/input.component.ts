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
  liveDraft = ''; // Funciona como preview para o usuário

  private recognition: any;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private microphoneStream?: MediaStream;

  private pitchTracker: number[] = [];
  private trackingInterval: any;
  private lastIdentifiedSpeaker: string = 'Voz Desconhecida';

  // Controle de agrupamento de blocos de fala (melhora a pontuação e reduz repetições do nome)
  private commitTimeout: any;
  private pendingTranscript: string = '';

  private knownSpeakers: SpeakerProfile[] = [];
  private availableNicknames: string[] = [];

  // Tolerância maior (45Hz) para cobrir a variação natural da entonação da mesma pessoa
  private readonly HZ_TOLERANCE: number = 45;
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
          // Atualiza a preview em tempo real para o usuário
          this.liveDraft = (this.pendingTranscript + ' ' + interimTranscript).trim();

          if (finalSegment) {
            this.pendingTranscript += ' ' + finalSegment;
            this.liveDraft = this.pendingTranscript.trim();

            // Cancela o timer anterior se a pessoa continuar falando rápido
            if (this.commitTimeout) clearTimeout(this.commitTimeout);

            // Aguarda 700ms de silêncio antes de confirmar o bloco.
            // Isso permite que a API nativa construa o contexto para aplicar a pontuação correta.
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
          // Restart rápido e silencioso
          setTimeout(() => {
            if (this.isRecording) {
              try { this.recognition.start(); } catch (e) { }
            }
          }, 50);
        }
      };

      this.recognition.start();
      this.isRecording = true;

      // Inicia captura de áudio para pitch separadamente, sem bloquear a interface
      setTimeout(async () => {
        try {
          if (!this.microphoneStream) {
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.setupAudioAnalysis(this.microphoneStream);
            this.startPitchTracking();
          }
        } catch (mediaError) {
          console.info('Aviso: Tracking de múltiplos falantes desativado. Utilizando apenas transcrição de voz padrão.', mediaError);
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

    // Limpeza para a próxima frase
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
    this.lastIdentifiedSpeaker = 'Voz Desconhecida';
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

      if (maxValue > 50) {
        const hz = (maxIndex * this.audioContext.sampleRate) / this.analyser.fftSize;
        // Escala normal da voz humana (homens ~85-180Hz, mulheres ~165-255Hz)
        if (hz > 80 && hz < 300) {
          this.pitchTracker.push(hz);
        }
      }
    }, 50);
  }

  // Substitui a Média pela Mediana para ignorar picos isolados (outliers)
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
      if (this.pitchTracker.length < 3) {
        // Se capturou poucos samples de áudio, confia na última voz reconhecida
        return this.lastIdentifiedSpeaker;
      }

      // Mediana é muito mais precisa que a média para ignorar ruídos e tosse
      const medianHz = this.getMedian(this.pitchTracker);

      const matchedSpeaker = this.knownSpeakers.find(
        speaker => Math.abs(speaker.medianHz - medianHz) <= this.HZ_TOLERANCE
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

      this.lastIdentifiedSpeaker = newNickname;
      return newNickname;

    } catch (error) {
      return this.lastIdentifiedSpeaker || '(erro na identificação)';
    }
  }

  private commitTranscript(speaker: string, transcript: string) {
    // Formata o texto final com o nome gerado e quebra de linha
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