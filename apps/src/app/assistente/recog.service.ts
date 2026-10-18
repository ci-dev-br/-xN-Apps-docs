import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Injectable({
    providedIn: 'root'
})
export class VoiceRecognitionService {
    // ... (suas variáveis do código anterior) ...
    recognition: any;
    isListening = false;
    public text = '';
    public commandSubject = new Subject<string>();

    // --- NOVAS VARIÁVEIS PARA SÍNTESE DE VOZ ---
    private synth = window.speechSynthesis;
    public vozesDisponiveis: SpeechSynthesisVoice[] = [];
    public vozSelecionada: SpeechSynthesisVoice | null = null;
    public isSpeaking = false;

    constructor(private zone: NgZone) { }

    init() {
        //   this.iniciarReconhecimentoDeVoz(); // Seu código antigo de inicialização do microfone
        this.carregarVozes();              // Carrega as vozes do sistema
    }

    // ... (Mantenha seu método init() antigo renomeado para iniciarReconhecimentoDeVoz) ...

    // --- MÉTODOS DE FALA (TEXT-TO-SPEECH) ---

    private carregarVozes() {
        const fetchVoices = () => {
            // Pega todas as vozes e filtra apenas as em Português do Brasil
            this.vozesDisponiveis = this.synth.getVoices().filter(v => v.lang === 'pt-BR');

            // Define a primeira voz BR como padrão, se existir
            if (this.vozesDisponiveis.length > 0 && !this.vozSelecionada) {
                this.vozSelecionada = this.vozesDisponiveis[1];
            }
        };

        fetchVoices();
        // O Chrome carrega as vozes de forma assíncrona, precisamos deste evento:
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = fetchVoices;
        }
    }

    public definirVoz(voz: SpeechSynthesisVoice) {
        this.vozSelecionada = voz;
    }

    public async falar(texto: string) {
        return await new Promise<void>(res => {
            if (this.synth.speaking) {
                console.warn('A IA já está falando no momento.');
                this.synth.cancel(); // Opcional: corta a fala atual para iniciar a nova
            }

            if (texto !== '') {
                const utterThis = new SpeechSynthesisUtterance(texto);

                if (this.vozSelecionada) {
                    utterThis.voice = this.vozSelecionada;
                }

                // Configurações da voz (brinque com esses valores para mudar a personalidade)
                utterThis.pitch = 1; // Tom da voz (0 a 2)
                utterThis.rate = 1.1; // Velocidade (0.1 a 10) - 1.1 dá um ritmo mais dinâmico

                utterThis.onstart = () => {
                    this.zone.run(() => this.isSpeaking = true);
                };

                utterThis.onend = () => {
                    this.zone.run(() => this.isSpeaking = false);

                    res();
                };

                utterThis.onerror = (event) => {
                    console.error('Erro na síntese de voz', event);
                    this.zone.run(() => this.isSpeaking = false);
                };

                this.synth.speak(utterThis);
            }
        });
    }
}