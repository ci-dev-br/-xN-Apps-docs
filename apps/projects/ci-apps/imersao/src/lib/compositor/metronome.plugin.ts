// plugins/metronome.plugin.ts
import { MusicPlugin } from './music-plugin.interface';

export class MetronomePlugin implements MusicPlugin {
    id = 'metro-1';
    name = 'Metrônomo';
    type = 'instrument' as const;

    private audioCtx!: AudioContext;

    init(audioCtx: AudioContext) {
        this.audioCtx = audioCtx;
    }

    onStep(stepIndex: number) {
        // Toca apenas na cabeça do tempo (1/4 notes num grid de 16 steps)
        if (stepIndex % 4 === 0) {
            this.playClick(stepIndex === 0 ? 1200 : 800); // Tom mais alto no início do compasso
        }
    }

    private playClick(frequency: number) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination); // Metrônomo vai direto pra saída, ignorando efeitos

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }
}