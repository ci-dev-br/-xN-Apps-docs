import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Subject } from "rxjs";
@Injectable()
export class AudioModemService {
    private audioContext?: AudioContext;
    // Frequências quase inaudíveis (Near-ultrasonic)
    private readonly FREQ_0 = 18500; // Representa o bit '0'
    private readonly FREQ_1 = 19500; // Representa o bit '1'
    private readonly BIT_DURATION = 0.1; // 100ms por bit
    // Receptor
    private analyser!: AnalyserNode;
    private mediaStream!: MediaStream;
    public messageReceived = new Subject<string>();
    private isListening = false;
    protected isBrowser: boolean;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        if (!this.isBrowser) return;
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // ==========================================
    // TRANSMISSOR (Texto -> Binário -> Áudio)
    // ==========================================
    public async sendMessage(text: string) {
        if (!this.isBrowser) return;
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
        const binaryString = this.textToBinary(text);
        // Adicionamos um cabeçalho simples '1010' para "acordar" o receptor (sincronização básica)
        const payload = '1010' + binaryString;
        const oscillator = this.audioContext!.createOscillator();
        oscillator.type = 'sine';
        const gainNode = this.audioContext!.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        let startTime = this.audioContext!.currentTime;
        for (let i = 0; i < payload.length; i++) {
            const bit = payload[i];
            const freq = bit === '1' ? this.FREQ_1 : this.FREQ_0;
            oscillator.frequency.setValueAtTime(freq, startTime);
            startTime += this.BIT_DURATION;
        }
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(startTime);
    }
    private textToBinary(text: string): string {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join('');
    }
    // ==========================================
    // RECEPTOR (Áudio -> FFT -> Binário -> Texto)
    // ==========================================
    public async startListening() {
        if (!this.isBrowser) return;
        if (this.isListening) return;
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const source = this.audioContext!.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext!.createAnalyser();
            this.analyser.fftSize = 2048; // Resolução da análise de frequência
            source.connect(this.analyser);
            this.isListening = true;
            this.processAudioData();
        } catch (err) {
            console.error('Erro ao acessar o microfone:', err);
        }
    }
    public stopListening() {
        if (!this.isBrowser) return;
        this.isListening = false;
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
    }
    private processAudioData() {
        if (!this.isBrowser) return;
        if (!this.isListening) return;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let currentBinary = '';
        let lastProcessTime = 0;
        const analyze = () => {
            if (!this.isListening) return;
            this.analyser.getByteFrequencyData(dataArray);
            // Cálculo de qual "bin" (índice do array) corresponde às nossas frequências
            const nyquist = this.audioContext!.sampleRate / 2;
            const bin0 = Math.round((this.FREQ_0 / nyquist) * bufferLength);
            const bin1 = Math.round((this.FREQ_1 / nyquist) * bufferLength);
            const magnitude0 = dataArray[bin0];
            const magnitude1 = dataArray[bin1];
            const threshold = 150; // Limiar de volume (0 a 255)
            const now = this.audioContext!.currentTime;
            // Amostragem simples a cada ciclo do BIT_DURATION
            if (now - lastProcessTime >= this.BIT_DURATION) {
                if (magnitude1 > threshold && magnitude1 > magnitude0) {
                    currentBinary += '1';
                    lastProcessTime = now;
                } else if (magnitude0 > threshold && magnitude0 > magnitude1) {
                    currentBinary += '0';
                    lastProcessTime = now;
                } else {
                    // Silêncio ou ruído. Se temos dados na string binária, tentamos decodificar.
                    if (currentBinary.length > 8) {
                        this.decodeAndEmit(currentBinary);
                        currentBinary = ''; // Reseta após tentar decodificar
                    }
                }
            }
            requestAnimationFrame(analyze);
        };
        analyze();
    }
    private decodeAndEmit(binaryString: string) {
        if (!this.isBrowser) return;
        // Remove o cabeçalho '1010' que usamos para acordar o microfone
        const payload = binaryString.replace(/^1010/, '');
        let text = '';
        for (let i = 0; i < payload.length; i += 8) {
            const byte = payload.slice(i, i + 8);
            if (byte.length === 8) {
                text += String.fromCharCode(parseInt(byte, 2));
            }
        }
        if (text.trim()) {
            this.messageReceived.next(text);
        }
    }
}