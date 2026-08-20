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

  async toggleTranscription() {
    if (this.isRecording) {
      this.stopTranscription();
    } else {
      await this.startTranscription();
    }
  }

  private async startTranscription() {
    try {
      if (!this.microphoneStream) {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.setupAudioAnalysis(this.microphoneStream);
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.startPitchTracking();

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
            this.pitchTracker = [];
            this.liveDraft = '';
          }
        });
      };

      // TRATAMENTO DE ERROS PARA EVITAR LOOP INFINITO EM CASO DE BLOQUEIO
      this.recognition.onerror = (event: any) => {
        console.warn('Alerta na transcrição:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          // Se o usuário revogou a permissão de microfone, devemos forçar a parada
          this.isRecording = false;
        }
      };

      // O SEGREDO ESTÁ AQUI: O AUTO-RESTART
      this.recognition.onend = () => {
        if (this.isRecording) {
          console.log('A API parou inesperadamente. Reiniciando...');
          try {
            this.recognition.start(); // Reinicia a escuta automaticamente
          } catch (e) {
            console.error('Falha ao tentar reiniciar o SpeechRecognition', e);
          }
        }
      };

      this.recognition.start();
      this.isRecording = true;

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      this.isRecording = false;
    }
  }

  private stopTranscription() {
    this.isRecording = false; // Flag crucial para o `onend` saber que foi intencional

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
  }

  private setupAudioAnalysis(stream: MediaStream) {
    if (this.audioContext) return; // Evita criar múltiplos contextos
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(stream);

    this.analyser.fftSize = 2048;
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

      if (maxValue > 120) {
        const hz = (maxIndex * this.audioContext.sampleRate) / this.analyser.fftSize;
        this.pitchTracker.push(hz);
      }
    }, 50);
  }

  // Lista para armazenar o padrão de cada falante reconhecido
  private knownSpeakers: SpeakerProfile[] = [];

  // Lista de apelidos disponíveis para novos falantes
  private availableNicknames: string[] = [

  ];

  private readonly HZ_TOLERANCE: number = 15;
  geradorNome = new GeradorDeNomes();

  private identifySpeakerByHz(): string {
    try {
      if (this.pitchTracker.length === 0) return 'Voz Desconhecida';

      // 1. Calcula a frequência média atual
      const sum = this.pitchTracker.reduce((a, b) => a + b, 0);
      const avgHz = sum / this.pitchTracker.length;

      // 2. Tenta encontrar um falante conhecido dentro da margem de tolerância
      const matchedSpeaker = this.knownSpeakers.find(
        speaker => Math.abs(speaker.avgHz - avgHz) <= this.HZ_TOLERANCE
      );

      // Se encontrou, retorna o apelido já registrado
      if (matchedSpeaker) {
        return matchedSpeaker.nickname;
      }

      // 3. Se não encontrou, é uma voz nova. Vamos registrar!
      // Pega o próximo apelido da lista ou cria um genérico se a lista acabar
      const newNickname = this.availableNicknames.length > 0
        ? this.availableNicknames.shift()!
        : this.geradorNome.gerarNomeCompleto(Math.floor(Math.random() * 5));

      // Armazena o novo perfil de voz
      this.knownSpeakers.push({
        nickname: newNickname,
        avgHz: avgHz
      });

      return newNickname;
    } catch (error) {
      return '(erro na identificação)';

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