import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Optional, Output, ViewChild, NgZone } from '@angular/core';
import { FormControlDirective, FormGroupDirective, FormGroup } from '@angular/forms';
import { GeradorDeNomes } from './geradore-nome';

export interface SpeakerProfile {
  nickname: string;
  avgHz: number;
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
  private lastIdentifiedSpeaker: string = 'Voz Desconhecida'; // Memória para frases rápidas

  // Lista para armazenar o padrão de cada falante reconhecido
  private knownSpeakers: SpeakerProfile[] = [];
  private availableNicknames: string[] = [];
  private readonly HZ_TOLERANCE: number = 15;
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
      // 1. Inicializa o contexto no evento de clique para evitar o estado "suspended" (Regra do Mobile)
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
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        this.ngZone?.run(() => {
          this.liveDraft = interimTranscript;

          if (finalTranscript) {
            const speaker = this.identifySpeakerByHz();
            this.commitTranscript(speaker, finalTranscript);

            // Reseta o rastreador para a próxima frase, mas mantém a memória no lastIdentifiedSpeaker
            this.pitchTracker = [];
            this.liveDraft = '';
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
          console.log('A API parou inesperadamente. Reiniciando...');
          setTimeout(() => {
            if (this.isRecording) {
              try {
                this.recognition.start();
              } catch (e) {
                console.error('Falha ao tentar reiniciar', e);
              }
            }
          }, 400); // Pequeno delay evita que o mobile bloqueie por loop excessivo
        }
      };

      // INICIAMOS O RECONHECIMENTO DE FALA PRIMEIRO!
      // Isso garante que a API nativa pegue o microfone nos smartphones
      this.recognition.start();
      this.isRecording = true;

      // SÓ ENTÃO tentamos pegar o Stream de Áudio para o tracking de Pitch.
      // Se falhar (como acontece em muitos celulares por bloqueio de concorrência dupla do microfone),
      // capturamos o erro e o reconhecimento de voz padrão continuará funcionando perfeitamente.
      try {
        if (!this.microphoneStream) {
          this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.setupAudioAnalysis(this.microphoneStream);
          this.startPitchTracking();
        }
      } catch (mediaError) {
        console.warn('Falha ao iniciar diarização (comum em mobile por bloqueio de concorrência de microfone). A transcrição padrão continuará funcionando.', mediaError);
      }

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      this.isRecording = false;
    }
  }

  private stopTranscription() {
    this.isRecording = false;

    if (this.recognition) {
      this.recognition.stop();
    }

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

      // Reduzimos o threshold de 120 para 50 para capturar falas mais baixas
      if (maxValue > 50) {
        const hz = (maxIndex * this.audioContext.sampleRate) / this.analyser.fftSize;
        // Filtramos para ignorar ruídos ambientes fora do espectro de voz humana grave/médio
        if (hz > 50 && hz < 1000) {
          this.pitchTracker.push(hz);
        }
      }
    }, 50);
  }

  private identifySpeakerByHz(): string {
    try {
      // Se não captou frequências (intervalo muito rápido ou voz baixa), reaproveita o último
      if (this.pitchTracker.length === 0) {
        return this.lastIdentifiedSpeaker;
      }

      const sum = this.pitchTracker.reduce((a, b) => a + b, 0);
      const avgHz = sum / this.pitchTracker.length;

      const matchedSpeaker = this.knownSpeakers.find(
        speaker => Math.abs(speaker.avgHz - avgHz) <= this.HZ_TOLERANCE
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
        avgHz: avgHz
      });

      this.lastIdentifiedSpeaker = newNickname;
      return newNickname;

    } catch (error) {
      return this.lastIdentifiedSpeaker || '(erro na identificação)';
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