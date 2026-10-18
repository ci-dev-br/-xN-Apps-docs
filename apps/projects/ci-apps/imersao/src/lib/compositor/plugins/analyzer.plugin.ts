// plugins/analyzer.plugin.ts
import { MusicPlugin } from '../music-plugin.interface';

export class ConsoleVisualizerPlugin implements MusicPlugin {
    id = 'vis-console-1';
    name = 'Console Level Meter';
    type = 'analyzer' as const;

    private analyzer!: AnalyserNode;
    private dataArray!: Uint8Array;

    init(audioCtx: AudioContext) {
        this.analyzer = audioCtx.createAnalyser();
        this.analyzer.fftSize = 32; // Resolução baixa por ser apenas medidor
        this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
    }

    setupAudioChain(input: AudioNode, output: AudioNode) {
        // Liga o input no analisador e repassa para o output (pass-through)
        input.connect(this.analyzer);
        this.analyzer.connect(output);
    }

    onStep() {
        this.analyzer.getByteTimeDomainData(this.dataArray as any);
        // Pega o pico de volume do momento atual
        const maxVolume = Math.max(...this.dataArray);
        const normalized = (maxVolume - 128) / 128; // Valores entre 0 e 1

        if (normalized > 0.1) {
            console.log(`[Level Meter] Volume Spike: ${Math.round(normalized * 100)}% 📊`);
        }
    }
}