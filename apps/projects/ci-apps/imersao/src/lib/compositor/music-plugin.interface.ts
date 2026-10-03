
// music-plugin.interface.ts
export interface MusicPlugin {
  id: string;
  name: string;
  type: 'effect' | 'instrument' | 'analyzer';

  // Inicializa recursos do plugin
  init(audioCtx: AudioContext): void;

  // Conecta o plugin na cadeia de áudio (para Efeitos)
  setupAudioChain?(input: AudioNode, output: AudioNode): void;

  // Executado a cada batida do sequenciador
  onStep?(stepIndex: number, bpm: number): void;

  // Limpeza de memória
  destroy?(): void;
}