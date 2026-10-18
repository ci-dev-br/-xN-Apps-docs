// plugins/delay.plugin.ts
import { MusicPlugin } from './music-plugin.interface';

export class DelayPlugin implements MusicPlugin {
    id = 'delay-fx-1';
    name = 'Delay Espacial';
    type = 'effect' as const;

    private audioCtx!: AudioContext;
    private delayNode!: DelayNode;
    private feedbackGain!: GainNode;

    init(audioCtx: AudioContext) {
        this.audioCtx = audioCtx;
        this.delayNode = this.audioCtx.createDelay(1.0);
        this.feedbackGain = this.audioCtx.createGain();

        // Configuração base do Delay: 300ms de atraso, 40% de feedback
        this.delayNode.delayTime.value = 0.3;
        this.feedbackGain.gain.value = 0.4;
    }

    setupAudioChain(input: AudioNode, output: AudioNode) {
        // Rota 1: O som original passa direto para a saída
        input.connect(output);

        // Rota 2: O som vai para o Delay
        input.connect(this.delayNode);
        this.delayNode.connect(output);

        // Rota de Feedback: O delay volta para si mesmo reduzindo o volume
        this.delayNode.connect(this.feedbackGain);
        this.feedbackGain.connect(this.delayNode);
    }
}