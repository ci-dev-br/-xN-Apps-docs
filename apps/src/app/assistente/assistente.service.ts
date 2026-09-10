import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Declaração para evitar erros de tipagem do TypeScript com a Web Speech API
declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Injectable({
    providedIn: 'root'
})
export class AssistenteService {
    private recognition: any;
    private isListening = false;
    private transcriptSubject = new Subject<string>();
    private statusSubject = new Subject<boolean>();

    constructor(private ngZone: NgZone) {
        this.initRecognition();
    }

    private initRecognition() {
        const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            console.error('Web Speech API não é suportada neste navegador.');
            return;
        }

        this.recognition = new SpeechRecognitionAPI();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = true; // Mantém ouvindo
        this.recognition.interimResults = true; // Retorna resultados parciais

        this.recognition.onresult = (event: any) => {
            this.ngZone.run(() => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                const transcript = finalTranscript || interimTranscript;
                this.transcriptSubject.next(transcript.trim().toLowerCase());
            });
        };

        this.recognition.onerror = (event: any) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            this.stop();
        };

        this.recognition.onend = () => {
            this.ngZone.run(() => {
                // Se ainda deveria estar escutando (modo contínuo), reinicia
                if (this.isListening) {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        // Evita erro caso já esteja rodando
                    }
                } else {
                    this.statusSubject.next(false);
                }
            });
        };
    }

    public start(): void {
        if (!this.recognition) return;
        this.isListening = true;
        try {
            this.recognition.start();
            this.statusSubject.next(true);
        } catch (e) {
            console.log('Reconhecimento já iniciado');
        }
    }

    public stop(): void {
        if (!this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
        this.statusSubject.next(false);
    }

    public getTranscript(): Observable<string> {
        return this.transcriptSubject.asObservable();
    }

    public getStatus(): Observable<boolean> {
        return this.statusSubject.asObservable();
    }
}