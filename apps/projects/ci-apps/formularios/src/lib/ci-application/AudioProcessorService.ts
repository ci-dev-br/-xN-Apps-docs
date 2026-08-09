import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

// -------------------------------------------------------------------------
// 1. Interfaces de Tipagem
// -------------------------------------------------------------------------
export interface AudioSegment {
  buffer: Float32Array;
  sampleRate: number;
}

export interface PitchedSegment extends AudioSegment {
  frequency: number;
  note: string;
}

export interface TranscribedSegment extends PitchedSegment {
  text: string;
}

// -------------------------------------------------------------------------
// 2. Operador RxJS: Detecção de Afinação (Pitch Tracking)
// -------------------------------------------------------------------------
export const detectPitch = () =>
  map((segment: AudioSegment): PitchedSegment => {
    const frequency = autoCorrelate(segment.buffer, segment.sampleRate);
    const note = getMusicalNote(frequency);

    return { ...segment, frequency, note };
  });

// -------------------------------------------------------------------------
// 3. Operador RxJS: Transcrição de Texto
// -------------------------------------------------------------------------
export const transcribeAudio = () =>
  mergeMap(async (segment: PitchedSegment): Promise<TranscribedSegment> => {
    // NOTA: Transformar um Float32Array em texto nativamente no JS requer 
    // um modelo de Machine Learning (ex: Whisper.wasm) ou uma API externa (Google/AWS).
    // Aqui simularemos o retorno. Em produção, você enviaria o `segment.buffer` 
    // para o seu backend via WebSocket ou usaria a Web Speech API em paralelo.

    const text = await simulateSpeechToText(segment.buffer);

    return { ...segment, text };
  });

// -------------------------------------------------------------------------
// 4. Serviço Angular Principal
// -------------------------------------------------------------------------
@Injectable()
export class AudioProcessorService {
  private audioContext: AudioContext | null = null;

  constructor() { }

  /**
   * Solicita acesso ao microfone e retorna um Observable de segmentos processados
   */
  public startListening(): Observable<TranscribedSegment> {
    return new Observable<AudioSegment>((subscriber: Subscriber<AudioSegment>) => {
      let mediaStream: MediaStream;
      let processorNode: ScriptProcessorNode; // Ou AudioWorklet em implementações mais modernas

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaStream = stream;
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = this.audioContext.createMediaStreamSource(stream);

          // Captura blocos de 4096 samples
          processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

          processorNode.onaudioprocess = (e) => {
            const buffer = e.inputBuffer.getChannelData(0);
            // Clonamos o buffer pois ele é sobrescrito rapidamente pela Web Audio API
            subscriber.next({
              buffer: new Float32Array(buffer),
              sampleRate: this.audioContext!.sampleRate
            });
          };

          source.connect(processorNode);
          processorNode.connect(this.audioContext.destination);
        })
        .catch(err => subscriber.error(err));

      // Cleanup logic quando houver unsubscribe
      return () => {
        if (processorNode) processorNode.disconnect();
        if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
        if (this.audioContext) this.audioContext.close();
      };
    }).pipe(
      // Aplicamos nossos pipes customizados aqui!
      detectPitch(),
      transcribeAudio()
    );
  }
}

// -------------------------------------------------------------------------
// 5. Funções Matemáticas e Auxiliares
// -------------------------------------------------------------------------

/**
 * Algoritmo de Autocorrelação para encontrar a Frequência Fundamental (Pitch)
 */
function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  let r1 = 0, r2 = buffer.length - 1, thres = 0.2;

  for (let i = 0; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[buffer.length - i]) < thres) { r2 = buffer.length - i; break; }
  }

  buffer = buffer.slice(r1, r2);
  let c = new Array(buffer.length).fill(0);
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < buffer.length - i; j++) {
      c[i] = c[i] + buffer[j] * buffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < buffer.length; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }

  let T0 = maxpos;
  return T0 === 0 ? -1 : sampleRate / T0;
}

/**
 * Converte uma frequência (Hz) em uma nota musical usando o sistema temperado
 * Fórmula: n = 12 * log2(f / 440)
 */
function getMusicalNote(frequency: number): string {
  if (frequency <= 0 || isNaN(frequency)) return 'Silêncio';

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // 440 Hz é a nota Lá (A4) de referência
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  const noteIndex = Math.round(noteNum) + 69; // 69 é o A4 em MIDI

  const octave = Math.floor(noteIndex / 12) - 1;
  const noteName = notes[noteIndex % 12];

  return `${noteName}${octave}`;
}

/**
 * Mock para simular o processo de Speech-to-Text
 */
async function simulateSpeechToText(buffer: Float32Array): Promise<string> {
  return new Promise(resolve => {
    // Calculamos o volume para simular detecção de voz vs silêncio
    const rms = Math.sqrt(buffer.reduce((acc, val) => acc + val * val, 0) / buffer.length);
    setTimeout(() => {
      resolve(rms > 0.05 ? "(voz detectada)" : "...");
    }, 50);
  });
}