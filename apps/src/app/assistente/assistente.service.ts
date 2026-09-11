import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

// Declaração para evitar erros de compilação no TypeScript
declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Injectable({
    providedIn: 'root'
})
export class AssistenteService {
    recognition: any;
    isListening = false;
    public text = '';
    public commandSubject = new Subject<[string, string]>();
    constructor(private zone: NgZone) { }
    init() {
        const SpeechRecog = webkitSpeechRecognition || SpeechRecognition;
        if (!SpeechRecog) {
            console.error('Navegador não suporta Web Speech API.');
            return;
        }
        this.recognition = new SpeechRecog();
        this.recognition.interimResults = false;
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = true;
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
        this.recognition.addEventListener('end', () => {
            if (this.isListening) {
                this.recognition.start();
            }
        });
    }
    start() {
        this.isListening = true;
        this.recognition.start();
        console.log('Assistente de voz ativado.');
    }
    stop() {
        this.isListening = false;
        this.recognition.stop();
        console.log('Assistente de voz desativado.');
    }
}