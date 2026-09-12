import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AssistenteService {
    recognition: any;

    // Intenção do usuário: O assistente DEVE estar ouvindo?
    isListening = false;

    // Estado real da API: O microfone ESTÁ gravando agora?
    private isRecognizing = false;

    public text = '';
    public commandSubject = new Subject<[string, string]>();

    constructor(private zone: NgZone) { }

    init() {
        // Acesso seguro ao objeto window para evitar erros caso use SSR (Server-Side Rendering)
        const SpeechRecog = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecog) {
            console.error('Navegador não suporta Web Speech API.');
            return;
        }

        this.recognition = new SpeechRecog();
        this.recognition.interimResults = false;
        this.recognition.lang = 'pt-BR';

        // No Android e Windows ajuda. No iOS, será na prática ignorado, 
        // mas o nosso controle manual no evento 'end' garantirá o funcionamento.
        this.recognition.continuous = true;

        // Atualiza o estado real quando a gravação efetivamente começa
        this.recognition.addEventListener('start', () => {
            this.isRecognizing = true;
        });

        this.recognition.addEventListener('result', (e: any) => {
            const transcript = Array.from(e.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');

            this.zone.run(() => {
                this.text = transcript;
                const normalizedCommand = transcript.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
                this.commandSubject.next([normalizedCommand, transcript]);
            });
        });

        // O tratamento de erro é VITAL no mobile. 
        // Sem isso, erros de 'no-speech' viram loops infinitos.
        this.recognition.addEventListener('error', (e: any) => {
            console.warn('Erro no reconhecimento de voz:', e.error);
            this.isRecognizing = false;

            // Se o usuário negou permissão, devemos parar de tentar forçar
            if (e.error === 'not-allowed') {
                this.isListening = false;
            }
        });

        this.recognition.addEventListener('end', () => {
            this.isRecognizing = false;

            // A mágica para o Android não quebrar: não reinicie imediatamente.
            // Um pequeno timeout dá tempo ao sistema operacional para liberar o recurso de áudio.
            if (this.isListening) {
                setTimeout(() => {
                    // Verifica novamente se a intenção ainda é ouvir e se já não foi reiniciado
                    if (this.isListening && !this.isRecognizing) {
                        try {
                            this.recognition.start();
                        } catch (err) {
                            console.error('Erro ao tentar reiniciar o reconhecimento:', err);
                        }
                    }
                }, 400); // 400ms é o suficiente para evitar o "flapping" de hardware no Android
            }
        });
    }

    start() {
        if (!this.recognition) return;

        this.isListening = true;

        // Só chama o start() se o motor estiver realmente parado, evitando DOMException
        if (!this.isRecognizing) {
            try {
                this.recognition.start();
                console.log('Assistente de voz ativado.');
            } catch (err) {
                console.warn('Microfone já estava em processo de inicialização.', err);
            }
        }
    }

    stop() {
        if (!this.recognition) return;

        this.isListening = false;

        if (this.isRecognizing) {
            this.recognition.stop();
            console.log('Assistente de voz desativado.');
        }
    }
}